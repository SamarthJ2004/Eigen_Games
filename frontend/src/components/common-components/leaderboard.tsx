import { Trophy, Medal, ChevronLeft, ChevronRight } from "lucide-react";

const Leaderboard = ({isMinimized, setIsMinimized}) => {
  
  const leaderboardData = [
    { id: 1, name: "Alice", score: 2850, rank: 1 },
    { id: 2, name: "Bob", score: 2720, rank: 2 },
    { id: 3, name: "Charlie", score: 2680, rank: 3 },
    { id: 4, name: "Denise", score: 2550, rank: 4 },
    { id: 5, name: "Eliza", score: 2490, rank: 5 },
    { id: 6, name: "Francis", score: 2470, rank: 6 },
    { id: 7, name: "Hans", score: 2420, rank: 7 },
    { id: 8, name: "Ivy", score: 2380, rank: 8 },
    { id: 9, name: "Jack", score: 2340, rank: 9 },
    { id: 10, name: "Karen", score: 2310, rank: 10 },
    { id: 11, name: "Leo", score: 2290, rank: 11 },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-gray-500">
            {rank}
          </span>
        );
    }
  };


  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-all duration-300 ${
        isMinimized ? "w-12" : "w-72"
      } bg-white shadow-lg border-r border-gray-200`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-150 z-10"
      >
        {isMinimized ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className={`p-6 ${isMinimized ? "hidden" : ""}`}>
        <h1 className="flex items-center justify-center text-3xl font-bold text-gray-800 mb-6">
          <Trophy className="w-8 h-8 text-yellow-500 mr-2" />
          Leaderboard
        </h1>
      </div>

      {/* Minimized View */}
      <div className={`p-2 ${!isMinimized ? "hidden" : ""}`}>
        <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
      </div>

      <div className={`px-4 pb-6 ${isMinimized ? "hidden" : ""}`}>
        <div className="overflow-y-auto h-[calc(100vh-12rem)] rounded-lg">
          {leaderboardData.map((player) => (
            <div
              key={player.id}
              className="mb-3 p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getRankIcon(player.rank)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {player.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Score: {player.score.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    player.rank <= 3 ? "text-yellow-500" : "text-gray-500"
                  }`}
                >
                  #{player.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
