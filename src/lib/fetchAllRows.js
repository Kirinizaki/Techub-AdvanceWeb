const PAGE_SIZE = 1000;
const MAX_ROWS = 100_000;

export async function fetchAllRows(queryFactory) {
  const rows = [];
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const { data, error } = await queryFactory().range(offset, offset + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) return { data: rows, error: null };
  }
  return { data: null, error: new Error("The result exceeds the maximum supported page count.") };
}
