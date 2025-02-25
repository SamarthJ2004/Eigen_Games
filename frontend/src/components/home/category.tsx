import { categories } from "@/lib/utils/constants/home";

const Category = () => {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Browse Categories
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`
              relative group overflow-hidden rounded-xl
              ${category.bgClass}
              hover:shadow-lg transform hover:-translate-y-1
              transition-all duration-300
            `}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(category.name);
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
          >
            <div className="relative z-10 p-6 flex flex-col items-center">
              <category.icon className="w-10 h-10 text-white mb-3" />
              <span className="text-white font-medium">{category.name}</span>
            </div>
            <div
              className={`
                absolute inset-0
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
              `}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Category;
