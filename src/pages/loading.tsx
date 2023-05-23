const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center space-x-2">
      <div className="h-3 w-3 animate-bounce rounded-full bg-white"></div>
      <div className="h-3 w-3 animate-bounce rounded-full bg-white animation-delay-200"></div>
      <div className="h-3 w-3 animate-bounce rounded-full bg-green-600 animation-delay-400"></div>
    </div>
  );
};

export default Loading;
