export default function Header() {
  const isLoggedIn = true;
  const firstName = "John";
  const userProfilePic = "https://picsum.photos/200";
  return (
    <div className="p-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold font-inter italic px-12 cursor-pointer ">
        Blogify
      </h1>
      <div className="flex items-center">
        <ul className="flex items-center font-display px-4">
          <li className="cursor-pointer px-2">Home</li>
          <li className="cursor-pointer px-2">Contact Us</li>
        </ul>
        <div className="flex items-center">
          <input
            className="p-2 bg-gray-100 rounded-md w-32"
            type="text"
            placeholder="Search"
          />
          <button className="ml-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
        <div className="ml-4">
          {isLoggedIn ? (
            <div className="flex items-center cursor-pointer">
              <img
                src={userProfilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="ml-2">{firstName}</span>
            </div>
          ) : (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
    