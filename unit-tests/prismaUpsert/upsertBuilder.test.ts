import { upsertNested } from "./upsertBuilder";
import { sampleProduct } from "./sampleProduct";

test("upsertNested works with full product", () => {
  const result = upsertNested(sampleProduct);

  console.log(JSON.stringify(result, null, 2));
});
