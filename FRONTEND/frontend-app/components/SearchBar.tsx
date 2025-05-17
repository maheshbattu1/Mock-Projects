// components/SearchBar.tsx
export default function SearchBar() {
    return (
      <div className="flex flex-col items-center bg-white py-6 shadow">
        <div className="flex space-x-4 text-sm font-medium">
          <button className="border-b-2 border-blue-600 text-blue-600 pb-2">Buy</button>
          <button>Rent</button>
          <button>New Launch</button>
          <button>PG / Co-living</button>
        </div>
        <div className="mt-4 flex w-full max-w-4xl px-4">
          <select className="border rounded-l px-4 py-2">
            <option>All Residential</option>
          </select>
          <input type="text" placeholder='Search "3 BHK for sale in Mumbai"' className="flex-1 border-t border-b px-4 py-2" />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-r">Search</button>
        </div>
      </div>
    );
  }
  