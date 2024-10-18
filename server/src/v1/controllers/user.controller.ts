import { ROLES } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { comparePassword, encryptPassword } from "helpers/bcrypt";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { generateAccessJwt, generateRefreshJwt } from "helpers/jwt";
import { RequestWithUser } from "middlewares/auth.middleware";
import { IUser, User } from "models/user.model";
import mongoose, { PipelineStage, Types } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, newObjectId, throwIfExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";

export const webLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findOne({
      email: new RegExp(`^${req.body.email}$`),
    }).exec();

    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    const passwordCheck = await comparePassword(UserExistCheck.password, req.body.password);
    if (!passwordCheck) {
      throw new Error(`Invalid Credentials`);
    }

    const token = await generateAccessJwt({
      userId: UserExistCheck._id,
      role: UserExistCheck.role,
      user: {
        name: UserExistCheck.name,
        email: UserExistCheck.email,
        phone: UserExistCheck.phone,
        _id: UserExistCheck._id,
      },
    });

    res.status(200).json({
      message: "User Logged In",
      token,
      user: {
        name: UserExistCheck.name,
        email: UserExistCheck.email,
        phone: UserExistCheck.phone,
        role: UserExistCheck.role,
        _id: UserExistCheck._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log(req.body);

    if (!req.body?.email) {
      throw { status: 401, message: "" };
    }
    const userObj = await User.findOne({
      email: new RegExp(`^${req.body.email}$`),
    })
      .lean()
      .exec();
    if (!userObj) {
      throw { status: 401, message: "user Not Found" };
    }

    // if (!verifyRefreshTokenJwt(req.body.email, req.body.refresh)) {
    //   throw { status: 401, message: "Refresh Token is not matched" };
    // }

    let accessToken = await generateAccessJwt({
      userId: userObj._id,
      role: ROLES.USER,
      name: userObj.name,
      phone: userObj.phone,
      email: userObj.email,
    });
    let refreshToken = await generateRefreshJwt({
      userId: userObj._id,
      role: ROLES.USER,
      name: userObj.name,
      phone: userObj.phone,
      email: userObj.email,
    });
    res.status(200).json({
      message: "Refresh Token",
      token: accessToken,
      refreshToken,
      success: true,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { email, phone, password, role, profileImage } = req.body;

    if (role === ROLES.ADMIN) throw new Error(ERROR.ROLE.INSUFFICIENT_PERMISSION);

    const requiredFields: any = {
      Password: password,
      Role: role,
    };

    if (!email && !phone) {
      requiredFields.Email = undefined;
      requiredFields.Phone = undefined;
    }

    verifyRequiredFields(requiredFields);

    if (!Object.values(ROLES).some((ROLE: any) => ROLE == role)) throw new Error(ERROR.ROLE.NOT_FOUND);

    password = await encryptPassword(req.body.password);

    if (email) {
      throwIfExist<IUser>(User, { email, isDeleted: false }, ERROR.USER.EMAIL_BEING_USED);
    }

    if (phone) {
      await throwIfExist<IUser>(User, { phone, isDeleted: false }, ERROR.USER.PHONE_BEING_USED);
    }

    //Additional data from the creater

    // password = await encryptPassword(password);




    if (profileImage) {
      if (typeof profileImage === "string") {
        profileImage = await storeFileAndReturnNameBase64(profileImage);
      } else {
        console.log("profileImage type should be string.");
      }
    }
    let userObj: IUser = {
      ...req.body,
      profileImage,
      password,
    };


       if (role == ROLES.SALES) {
         let storeId = req.user?.userId;
         let store = await User.findOne({ _id: storeId, isDeleted: false });

         if (store && store.role == ROLES.STORE) {
           
           userObj.countryId = store.countryId;
           userObj.countryName = store.countryName;
           userObj.stateId = store.stateId;
           userObj.stateName = store.stateName;
           userObj.cityId = store.cityId;
           userObj.cityName = store.cityName;
           userObj.areaId = store.areaId;
           userObj.areaName = store.areaName;
           userObj.zoneId = store.zoneId;
           userObj.zoneName = store.zoneName;
           userObj.storeId  = newObjectId(store._id);
         }
       }
    const newUser: any = await createDocuments(User, userObj);

    const data = {
      name: newUser?.name,
      email: newUser?.email,
      phone: newUser?.phone,
      role: newUser?.role,
    };


     

    res.status(201).json({ message: MESSAGE.USER.CREATED, data, success: true });
  } catch (error) {
    console.log(error, "ERROR IN CREATE USER");
    next(error);
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistNameCheck = await User.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
    }).exec();

    if (UserExistNameCheck) {
      throw new Error(`User with this name Already Exists`);
    }
    const UserExistEmailCheck = await User.findOne({
      email: new RegExp(`^${req.body.email}$`, "i"),
    }).exec();
    console.log(UserExistEmailCheck, "UserExistEmailCheck");
    if (UserExistEmailCheck) {
      throw new Error(`User with this email Already Exists`);
    }

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
    }).exec();
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }

    if (req.body.userName && req.body.userName != "") {
      const UserExistUserNameCheck = await User.findOne({
        userName: new RegExp(`^${req.body.userName}$`, "i"),
      }).exec();

      if (UserExistUserNameCheck) {
        throw new Error(`User with this username already exists`);
      }
    }

    req.body.password = await encryptPassword(req.body.password);

    const user = await new User({ ...req.body }).save();

    res.status(201).json({ message: "Registered", data: user._id });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId).exec();
    res.status(201).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

export const approveUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      approved: true,
    }).exec();
    res.status(201).json({ message: "User Approved" });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    // TODO add role checks
    if (req.query.role) {
      matchObj.role = req.query.role;
    }

    let role = req.query?.role;
    let userId = req.user.userId;

    let userObj = await User.findById(userId);

    console.log(userObj,"userObjuserObjuserObjuserObj")
      if (req.query.isVendor === "true" && !role) {
      matchObj.storeId = newObjectId(userId);
    }

    if (!req.query?.isVendor && role == ROLES.STORE && userObj && userObj?.zoneId) {
      matchObj.role = ROLES.STORE;
      matchObj.zoneId = newObjectId(userObj.zoneId);
      matchObj._id = { $ne: newObjectId(userId) };
    }

      if (!req.query?.isVendor && role == ROLES.ADMIN) {
        matchObj.role = ROLES.STORE;
      }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (typeof req.query.areaId === "string") {
      matchObj.areaId = newObjectId(req.query.areaId);
    }

    if (typeof req.query.search === "string") {
      matchObj.name = { $regex: new RegExp(req.query.search, "i") };
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    /**
     * Check Is there any sales call for today.
     * SalesManId will get req.userId
     *
     * $Lookup from salesCall.
     *
     *  For today,
     *
     *  sellerId = _id;
     *  userId = req.userId
     */

    console.log(pipeline, "pipline");

    const paginatedusers = await paginateAggregate(User, pipeline, req.query);

    if (req.query.getCountOnly) {
      res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: [], total: paginatedusers.total });
      return;
    }

    res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: paginatedusers.data, total: paginatedusers.total });
  } catch (error) {
    console.log(error, "ERROR IN GETUSER");
    next(error);
  }
};

export const getTaggedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId: Types.ObjectId;
    if (req.user?.userObj?.role === ROLES.ADMIN || req.user?.userObj?.role === ROLES.SUBADMIN) {
      userId = new mongoose.Types.ObjectId(req.params.id);
    } else {
      userId = req.user?.userObj?._id;
    }

    let matchObj: Record<string, any> = {};

    if (typeof req.query.role != "string" || !Object.keys(ROLES).includes(req.query.role)) {
      throw new Error(ERROR.ROLE.NOT_FOUND);
    }

    matchObj.role = req.query.role;

    /**
     * Getting Tags
     */

    let tagsGetUserIdPipeLine: PipelineStage[] = [
      {
        $match: {
          storeId: userId,
          role: req.query.role,
        },
      },
    ];

    let data: { data: any[]; total: number } = {
      data: [],
      total: 0,
    };

    const paginatedusers = await paginateAggregate(User, tagsGetUserIdPipeLine, req.query);

    // if (req.query.getCountOnly) {
    //   res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: [], total: paginatedusers.total });
    //   return;
    // }

    res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: paginatedusers.data, total: paginatedusers.total });
  } catch (error) {
    console.log(error, "ERROR IN GETUSER");
    next(error);
  }
};
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: "User Data", data: req.user?.userObj });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const obj: any = {};
    if (req.body.name) {
      obj.name = req.body.name;
    }
    if (req.body.password && req.body.password != "") {
      obj.password = await encryptPassword(req.body.password);
    } else {
      delete obj.password;
    }
    if (req.body.email) {
      const user = await User.find({
        email: new RegExp(`^${req.body.email}$`, "i"),
        _id: { $ne: (req as RequestWithUser).user?.userId },
      }).exec();
      if (user.length) {
        throw new Error("This email is already being used");
      }

      obj.email = req.body.email;
    }
    if (req.body.address) {
      obj.address = req.body.address;
    }
    // if (req.body.name) {
    //   obj.name = req.body.name;
    // }

    const user = await User.findByIdAndUpdate((req as RequestWithUser).user?.userId, obj, {
      new: true,
    }).exec();
    console.log(req.body, user);
    if (!user) throw new Error("User Not Found");
    res.json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};
export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req?.params?.id).exec();
    if (!user) {
      throw new Error("User does not exists");
    }

    let nameExists = await User.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
      _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
    })
      .lean()
      .exec();
    console.log(nameExists, "nameExists");
    if (nameExists) {
      throw new Error("Name you are trying to add already exists in our database for another user");
    }
    // let phoneExists = await User.findOne({phone:new RegExp(`^${req.body.phone}$`, "i"), _id:{$ne:new mongoose.Types.ObjectId(req.params.id)}}).lean().exec();
    // if (phoneExists) {
    // 	throw new Error("Phone number you are trying to add already exists in our database for another user");
    // }
    let emailExists = await User.findOne({
      email: new RegExp(`^${req.body.email}$`, "i"),
      _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
    })
      .lean()
      .exec();
    if (emailExists) {
      throw new Error("Email you are trying to add already exists in our database for another user");
    }

    if (req.body.password && req.body.password != "") {
      req.body.password = await encryptPassword(req.body.password);
    } else {
      delete req.body.password;
    }

    await User.findByIdAndUpdate(req?.params?.id, req.body, {
      new: true,
    }).exec();
    console.log(req.body, user);
    if (!user) throw new Error("User Not Found");
    res.json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user: any = await User.findById(req?.params?.id).lean().exec();
    if (!user) {
      throw new Error("User does not exists");
    }

    res.json({ message: "found user", data: user });
  } catch (error) {
    next(error);
  }
};
