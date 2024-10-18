export const paginationProcessor = (
  query: any,
  pageSizeKey: string = "pageSize",
  pageIndexKey: string = "pageIndex",
) => {
  let pageSize = parseInt(query[pageSizeKey]);
  let pageIndex = parseInt(query[pageIndexKey]);

  if (isNaN(pageSize)) {
    pageSize = 100;
  }

  if (isNaN(pageIndex)) {
    pageIndex = 0;
  }
  console.log(pageIndex, pageSize, "sdfjdshfjdskfhdsjkfhdsjdshjskdfhsdj");

  return {
    pageIndex: pageIndex - 1,
    pageSize,
    skip: (pageIndex) * pageSize,
  };
};
