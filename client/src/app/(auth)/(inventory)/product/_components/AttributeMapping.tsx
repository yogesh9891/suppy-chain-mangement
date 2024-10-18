import React, { useState, useEffect } from "react";

export interface AttributeType {
  _id: string;
  name: string;
  attributeId?: string;
  checked: boolean;
}

export interface AttributeCategoryType {
  _id: string;
  name: string;
  checked: boolean;
  price?: number;
  attributeValueId?: string;
  attributeValueArr: AttributeType[];
}

interface Props {
  attributesArr: AttributeCategoryType[];
  upliftAttribute: (attributesArr: AttributeCategoryType[]) => void;
}

const AttributesComponent: React.FC<Props> = ({ attributesArr, upliftAttribute }) => {
  const [attributeLocalArr, setAttributeLocalArr] = useState<AttributeCategoryType[]>(attributesArr);

  const handleAttributeCategoryCheck = (index: number, value: boolean) => {
    let tempArr = attributeLocalArr.map((el, i) => {
      if (index === i) {
        el.checked = value;
      }
      return el;
    });
    setAttributeLocalArr([...tempArr]);
    upliftAttribute(tempArr);
  };

  const handleAttributeCheck = (parentId: string, childId: string, value: boolean) => {
    let tempArr = attributeLocalArr.map((el) => {
      if (el._id === parentId) {
        let tempInnerArr = el.attributeValueArr.map((elm) => {
          if (elm._id === childId) {
            elm.checked = value;
          }
          return { ...elm };
        });
        el.attributeValueArr = [...tempInnerArr];
      }
      return { ...el };
    });
    setAttributeLocalArr([...tempArr]);
    upliftAttribute(tempArr);
  };

  useEffect(() => {
    setAttributeLocalArr(attributesArr);
  }, [attributesArr]);

  return (
    <>
      {attributeLocalArr &&
        attributeLocalArr.length > 0 &&
        attributeLocalArr.map((elx, indexXX) => {
          return (
            <div key={indexXX} className="col-md-3 mb-3">
              <div>
                <input
                  name="first_name"
                  type="checkbox"
                  id={`${indexXX}AttributeCategory${elx._id}`}
                  checked={elx.checked}
                  onChange={(e) => handleAttributeCategoryCheck(indexXX, !elx.checked)}
                />
                <strong style={{ paddingLeft: 15 }}>{elx.name}</strong>
              </div>
              {elx.checked &&
                elx.attributeValueArr &&
                elx.attributeValueArr.length > 0 &&
                elx.attributeValueArr.map((elm, indexXXX) => {
                  return (
                    <div key={indexXXX} className="col-12 ps-2 col-md-12 mb-3">
                      <div>
                        <input
                          name="first_name"
                          type="checkbox"
                          id={`${indexXXX}Attribute${elm._id}`}
                          checked={elm.checked ? elm.checked : false}
                          onChange={(e) => handleAttributeCheck(elx._id, elm._id, !elm.checked)}
                        />
                        <label htmlFor={`${indexXXX}Attribute${elm._id}`} style={{ paddingLeft: 15 }}>
                          {elm.name}
                        </label>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
    </>
  );
};

export default AttributesComponent;
