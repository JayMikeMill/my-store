export default function ProductLoader() {
  return (
    <div className="flex justify-center items-center h-[200px]">
      <div
        className="w-5 h-5 mx-1 bg-blue-500 rounded-full animate-bounce"
        style={{ animationDelay: "-0.32s" }}
      ></div>
      <div
        className="w-5 h-5 mx-1 bg-blue-500 rounded-full animate-bounce"
        style={{ animationDelay: "-0.16s" }}
      ></div>
      <div className="w-5 h-5 mx-1 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-5 h-5 mx-1 bg-blue-500 rounded-full animate-bounce"></div>
    </div>
  );
}
