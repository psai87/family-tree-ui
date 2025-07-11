function HomePage() {
    return (
        <>
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-white to-blue-100 p-6">
                <div className="bg-white shadow-xl rounded-2xl p-10 max-w-xl w-full text-center animate-fade-in">
                    <h1 className="text-4xl font-extrabold text-blue-700 mb-4 whitespace-nowrap">
                        👋 Welcome to Family Tree!
                    </h1>
                    <p className="text-gray-700 text-lg mb-6">
                        You can view all your relatives. This is in beta.
                    </p>
                </div>
            </div>
        </>
    )
}

export default HomePage