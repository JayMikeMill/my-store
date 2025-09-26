// Admin product dashboard page
import { useState, useEffect } from "react";
import type { Product } from "@shared/types/Product";
import { ProductEditorDialog } from "@pages/admin/product-dash/product-editor-dialog/ProductEditorDialog";
import { useApi } from "@api/useApi";
import DynamicTable from "@components/dynamic-table/DynamicTable";

export default function AdminProductsDash() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [tableKey, setTableKey] = useState(0);

  const getProducts = useApi().products.getAll;

  const handleDialogSave = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setTableKey((prev) => prev + 1);
  };

  const handleDialogCancel = () => {
    setIsAdding(false);
    setEditingProduct(null);
  };

  return (
    <div className="pt-lg pb-lg">
      {/* Product dialog */}
      <ProductEditorDialog
        product={editingProduct}
        onSave={handleDialogSave}
        onCancel={handleDialogCancel}
        open={editingProduct !== null || isAdding}
      />

      {/* Product list */}

      <DynamicTable
        fetchPage={getProducts}
        key={tableKey}
        onRowClick={(p) => setEditingProduct(p)}
        objectsName="Products"
        headerButton={
          <button
            className="btn-normal whitespace-nowrap"
            onClick={() => setIsAdding(true)}
          >
            Add Product
          </button>
        }
        columns={[
          {
            id: "image",
            label: "Image",
            width: "120px",
            render: (p) =>
              p.images?.[0] ? (
                <div className="flex items-center justify-center">
                  <img
                    src={p.images?.[0].thumbnail}
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 flex items-center justify-center 
                    bg-light rounded text-xs"
                >
                  No Image
                </div>
              ),
          },
          {
            id: "name",
            label: "Name",
            width: "120px",
            sortable: true,
            render: (p) => (
              <div className="flex items-center justify-center">
                <span className="font-semibold text-center text-text">
                  {p.name}
                </span>
              </div>
            ),
          },
          {
            id: "price",
            label: "Price",
            sortable: true,
            render: (p) => (
              <div className="flex items-center justify-center">
                <span className="font-semibold text-center text-text">
                  {p.price.toFixed(2)}
                </span>
              </div>
            ),
          },
          {
            id: "tags",
            width: "120px",
            label: "Tags",
            render: (p) => (
              <div className="flex items-center justify-center">
                <span className="font-semibold text-center text-text">
                  {p.tags?.join(", ") || "N/A"}
                </span>
              </div>
            ),
          },
          {
            id: "description",
            label: "Description",
            width: "300px",
            render: (p) => (
              <div className="flex items-top justify-left">
                <span className="font-semibold text-center text-text">
                  {p.description}
                </span>
              </div>
            ),
          },
        ]}
        pageSize={5}
        searchable={true}
      />
    </div>
  );
}
