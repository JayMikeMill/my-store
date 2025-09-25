import { type Address, type ShippingInfo } from "@shared/types/Shipping";

interface ShippingFormProps {
  shippingInfo: ShippingInfo;
  setShippingInfo: (info: ShippingInfo) => void;
}

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
];

export default function ShippingForm({
  shippingInfo,
  setShippingInfo,
}: ShippingFormProps) {
  // Unified change handler for all fields
  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.replace("address.", "") as keyof Address;
      const newAddress = { ...shippingInfo.address, [field]: value };
      let newName = shippingInfo.name;
      if (field === "firstName" || field === "lastName") {
        newName =
          `${field === "firstName" ? value : newAddress.firstName} ${field === "lastName" ? value : newAddress.lastName}`.trim();
      }
      setShippingInfo({ ...shippingInfo, address: newAddress, name: newName });
    } else {
      setShippingInfo({ ...shippingInfo, [name]: value });
    }
  };

  return (
    <div className="surface-box my-8 p-lg  flex flex-col gap-md text-text font-sans">
      <h3 className="text-2xl font-semibold mb-6 text-center">{`Shipping Information`}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name fields */}
        <label className="flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">First Name</span>
          <input
            type="text"
            name="address.firstName"
            value={shippingInfo.address.firstName}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Last Name</span>
          <input
            type="text"
            name="address.lastName"
            value={shippingInfo.address.lastName}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* Email */}
        <label className="col-span-1 sm:col-span-2 flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Email</span>
          <input
            type="email"
            name="email"
            value={shippingInfo.email}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* Phone */}
        <label className="col-span-1 sm:col-span-2 flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Phone</span>
          <input
            type="tel"
            name="phone"
            value={shippingInfo.phone || ""}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* Address Line 1 */}
        <label className="col-span-1 sm:col-span-2 flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Address Line 1</span>
          <input
            type="text"
            name="address.addressLine1"
            value={shippingInfo.address.addressLine1}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* Address Line 2 */}
        <label className="col-span-1 sm:col-span-2 flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Address Line 2</span>
          <input
            type="text"
            name="address.addressLine2"
            value={shippingInfo.address.addressLine2 || ""}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* City */}
        <label className="flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">City</span>
          <input
            type="text"
            name="address.city"
            value={shippingInfo.address.city}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* State / Province */}
        <label className="flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">State / Province</span>
          <input
            type="text"
            name="address.state"
            value={shippingInfo.address.state}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* Postal Code */}
        <label className="flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Postal Code</span>
          <input
            type="text"
            name="address.postalCode"
            value={shippingInfo.address.postalCode}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </label>
        {/* Country */}
        <label className="flex flex-col text-sm font-semibold text-textSecondary">
          <span className="mb-1">Country</span>
          <select
            name="address.country"
            value={shippingInfo.address.country}
            onChange={handleFieldChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
