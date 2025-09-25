import { useState, useEffect } from "react";
import { useApi } from "@api/useApi";
import type { Order } from "@shared/types/Order";

import DynamicTable from "@components/dynamic-table/DynamicTable";
import OrderDialog from "@components/dialogs/OrderDialog";

export default function AdminOrdersDash() {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [tableKey, setTableKey] = useState(0);

  const { orders } = useApi();

  const handleDialogClose = () => {
    setTableKey((prev) => prev + 1);
  };

  const handleSaveOrder = async (update: Partial<Order>) => {
    if (!editingOrder || !editingOrder.id) return;
    await orders.update({ ...editingOrder, ...update });
  };

  return (
    <div className="pt-lg pb-lg">
      <div className="p-0">
        {/* Order dialog */}
        {editingOrder && (
          <OrderDialog
            order={editingOrder}
            onClose={handleDialogClose}
            onSave={handleSaveOrder}
          />
        )}

        {/* Order list */}

        <DynamicTable
          fetchPage={orders.getAll}
          key={tableKey}
          onRowClick={(o) => setEditingOrder(o)}
          objectsName="Orders"
          pageSize={10}
          searchable={true}
          columns={[
            {
              id: "id",
              label: "Order ID",
              width: "250px",
              sortable: true,
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center text-text">
                    {o.id}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Order ID</span>,
            },
            {
              id: "userId",
              label: "User ID",
              width: "120px",
              sortable: true,
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center text-text">
                    {o.userId}
                  </span>
                </div>
              ),
              renderHeader: () => <span>User ID</span>,
            },
            {
              id: "name",
              label: "Name",
              width: "140px",
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center text-text">
                    {o.shippingInfo?.name || ""}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Name</span>,
            },
            {
              id: "address",
              label: "Address",
              width: "300px",
              render: (o) => {
                const a = o.shippingInfo?.address;
                if (!a)
                  return (
                    <div className="flex items-center justify-center whitespace-pre-wrap" />
                  );
                return (
                  <div className="flex flex-col items-center justify-center whitespace-pre-wrap text-center">
                    <span className="font-semibold text-text">
                      {[
                        `${a.firstName} ${a.lastName}`.trim(),
                        a.addressLine1,
                        a.addressLine2,
                        `${a.city}, ${a.state} ${a.postalCode}, ${a.country}`,
                      ]
                        .filter(Boolean)
                        .join("\n")}
                    </span>
                  </div>
                );
              },
              renderHeader: () => <span>Address</span>,
            },
            {
              id: "email",
              label: "Email",
              width: "250px",
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center whitespace-pre-wrap text-text">
                    {o.shippingInfo?.email || ""}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Email</span>,
            },
            {
              id: "phone",
              label: "Phone",
              width: "120px",
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center text-text">
                    {o.shippingInfo?.phone || ""}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Phone</span>,
            },
            {
              id: "status",
              label: "Status",
              width: "120px",
              sortable: true,
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center text-text">
                    {o.status}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Status</span>,
            },
            {
              id: "timestamps",
              label: "timestamps",
              width: "250px",
              sortable: true,
              render: (o) => (
                <div className="flex flex-col items-center justify-center text-center gap-1 whitespace-pre-wrap">
                  <span className="font-semibold text-text">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                  <span className="font-semibold text-text">
                    {new Date(o.updatedAt).toLocaleString()}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Created / Updated</span>,
            },

            {
              id: "total",
              label: "Total",
              width: "80px",
              sortable: true,
              render: (o) => (
                <div className="flex items-center justify-center">
                  <span className="font-semibold text-center text-text">
                    ${(o.total / 100).toFixed(2)}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Total</span>,
            },
            {
              id: "items",
              label: "Items",
              width: "50px",
              render: (o) => (
                <div className="flex items-center justify-center">
                  <span className="font-semibold text-center text-text">
                    {o.items?.length || 0}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Items</span>,
            },
            {
              id: "shipping",
              label: "Shipping Info",
              width: "150px",
              render: (o) => {
                const s = o.shippingInfo;
                if (!s)
                  return <div className="flex items-center justify-center" />;
                return (
                  <div className="flex flex-col items-center justify-center whitespace-pre text-center">
                    <span className="font-semibold text-text">
                      {[
                        `Method: ${s.method}`,
                        `Carrier: ${s.carrier}`,
                        s.trackingNumber
                          ? `Tracking: ${s.trackingNumber}`
                          : null,
                        s.cost ? `Cost: $${(s.cost / 100).toFixed(2)}` : null,
                        s.notes ? `Notes: ${s.notes}` : null,
                      ]
                        .filter(Boolean)
                        .join("\n")}
                    </span>
                  </div>
                );
              },
              renderHeader: () => <span>Shipping Info</span>,
            },
            {
              id: "transaction",
              label: "Transaction",
              width: "150px",
              render: (o) => {
                const p = o.transaction;
                if (!p)
                  return <div className="flex items-center justify-center" />;
                return (
                  <div className="flex flex-col items-center justify-center whitespace-pre text-center">
                    <span className="font-semibold text-text">
                      {[
                        //`Method: ${p.method}`,
                        `Status: ${p.status}`,
                        `Amount: $${(p.amount / 100).toFixed(2)}`,
                        //`Currency: ${p.currency}`,
                        //p.transactionId ? `Txn: ${p.transactionId}` : null,
                      ]
                        .filter(Boolean)
                        .join("\n")}
                    </span>
                  </div>
                );
              },
              renderHeader: () => <span>Payment Info</span>,
            },
            {
              id: "notes",
              label: "Notes",
              width: "300px",
              render: (o) => (
                <div className="flex items-center justify-center whitespace-pre-wrap">
                  <span className="font-semibold text-center text-text">
                    {o.notes || ""}
                  </span>
                </div>
              ),
              renderHeader: () => <span>Notes</span>,
            },
          ]}
        />
      </div>
    </div>
  );
}
