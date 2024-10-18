export const adminStockBuilder = (
  matchObj: Record<string, any>,
  StockObj: Record<string, any>,
  sortObj: Record<string, any>,
) => {
  return [
    {
      $match: matchObj,
    },
  {
    $lookup: {
      from: "productstocklogs",
      localField: "productId",
      foreignField: "productId",
      as: "productstocklogs",
      pipeline: [
        {
          $match: {
            type: "PURCHASE"
          }
        },
        {
          $group: {
            _id: "$productId",
            totalBuyItems: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$type", "PURCHASE"]
                  },
                  "$quantity",
                  0
                ]
              }
            },
            totalSellItems: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$type", "SELL"]
                  },
                  "$quantity",
                  0
                ]
              }
            }
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "companyorderlogs",
      let: {
        productId: "$productId"
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$productId", "$$productId"]
            }
          }
        },
        {
          $group: {
            _id: "$productId",
            totalQuantity: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "PENDING"]
                  },
                  "$previousQuantity",
                  0
                ]
              }
            },
            totalCancelQuantity: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "CANCELLED"]
                  },
                  "$quantity",
                  0
                ]
              }
            },
            totalStockItems: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "TRANSIT"]
                  },
                  "$quantity",
                  0
                ]
              }
            }
          }
        }
      ],
      as: "companyorders"
    }
  },
  {
    $unwind: {
      path: "$productstocklogs",
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $addFields: {
      totalTransitItems: {
        $subtract: [
          "$productstocklogs.totalBuyItems",
          "$productstocklogs.totalSellItems"
        ]
      },
      totalStockItems: {
        $ifNull: [
          {
            $arrayElemAt: [
              "$companyorders.totalStockItems",
              0
            ]
          },
          0
        ]
      },
      totalStock: {
        $subtract: [
          {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$companyorders.totalQuantity",
                  0
                ]
              },
              0
            ]
          },
          {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$companyorders.totalCancelQuantity",
                  0
                ]
              },
              0
            ]
          }
        ]
      }
    }
  },
  {
    $addFields: {
      totalPendingStock: {
        $subtract: [
          "$totalStock",
          "$totalStockItems"
        ]
      }
    }
  },
  {
    $group: {
      _id: "$productId",
      productId: {
        $first: "$productId"
      },
      name: {
        $first: "$name"
      },
      colorId: {
        $first: "$colorId"
      },
      sizeId: {
        $first: "$sizeId"
      },
      brandId: {
        $first: "$brandId"
      },
      quantity: {
        $sum: "$quantity"
      },
      totalTransitItems: {
        $first: "$totalTransitItems"
      },
      minStock: {
        $sum: "$minStock"
      },
      orderStock: {
        $sum: {
          $subtract: [
            "$minStock",
            "$totalTransitItems"
          ]
        }
      },
      stock: {
        $first: "$totalPendingStock"
      }
    }
  },
  {
    $sort: {
      name: 1
    }
  },
    { $sort: sortObj },
  ];
};

// [
//   {
//     $lookup: {
//       from: "productstocklogs",
//       localField: "productId",
//       foreignField: "productId",
//       as: "productstocklogs",
//       pipeline: [
//         {
//           $match: {
//             type: "PURCHASE"
//           }
//         },
//         {
//           $group: {
//             _id: "$productId",
//             totalBuyItems: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: ["$type", "PURCHASE"]
//                   },
//                   "$quantity",
//                   0
//                 ]
//               }
//             },
//             totalSellItems: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: ["$type", "SELL"]
//                   },
//                   "$quantity",
//                   0
//                 ]
//               }
//             }
//           }
//         }
//       ]
//     }
//   },
//   {
//     $lookup: {
//       from: "companyorderlogs",
//       localField: "productId",
//       foreignField: "productId",
//       as: "companyorders",
//       pipeline: [
//         {
//           $match: {
//             type: "PURCHASE",
//             status: {
//               $ne: "DELIVERED"
//             }
//           }
//         },
//         {
//           $group: {
//             _id: "$productId",
//             totalTransitItems: {
//               $sum: {
//                 $cond: [
//                   {
//                     $and: [
//                       {
//                         $eq: [
//                           "$status",
//                           "TRANSIT"
//                         ]
//                       }
//                     ]
//                   },
//                   "$currentQuantity",
//                   0
//                 ]
//               }
//             },
//             totalStockItems: {
//               $sum: "$quantity"
//             }
//           }
//         }
//       ]
//     }
//   },
//   {
//     $unwind: {
//       path: "$productstocklogs",
//       preserveNullAndEmptyArrays: false
//     }
//   },
//   {
//     $addFields: {
//       totalTransitItems: {
//         $subtract: [
//           "$productstocklogs.totalBuyItems",
//           "$productstocklogs.totalSellItems"
//         ]
//       }
//     }
//   },
//   {
//     $group: {
//       _id: "$productId",
//       quantity: {
//         $sum: "$quantity"
//       },
//       totalTransitItems: {
//         $sum: "$totalTransitItems"
//       },
//       minStock: {
//         $sum: "$minStock"
//       },
//       stock: {
//         $sum: {
//           $add: [
//             "$quantity",
//             "$totalTransitItems"
//           ]
//         }
//       }
//     }
//   },
//   {
//     $addFields: {
//       orderStock: {
//         $subtract: ["$minStock", "$stock"]
//       }
//     }
//   }
// ]
