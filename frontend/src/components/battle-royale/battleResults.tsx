import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BattleResults = (battleData) => {
  const getContestantName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const ScoreBar = ({ value, maxValue = 10, color }) => {
    const percentage = (value / maxValue) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Winner Alert */}
      <Alert className="border-2 border-yellow-400 bg-yellow-50">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {getContestantName(battleData.result.winner)} wins by{" "}
            {battleData.result.margin} point!
          </span>
          <div className="bg-yellow-500 h-8 w-fit px-4 rounded-sm flex justify-center items-center">
            BATTLE ENDED
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Battle Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{battleData.battle.technicalAnalysis}</p>
          <div className="mt-4">
            <span className="font-semibold">Winning Factor:</span>{" "}
            {battleData.result.winningFactor}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {battleData.battle.contestants.map((contestant) => (
          <Card
            key={contestant}
            className={`${
              contestant === battleData.result.winner.toLowerCase()
                ? "border-2 border-yellow-400"
                : ""
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>{getContestantName(contestant)}</span>
                <span className="text-2xl font-bold">
                  {battleData.scorecards[contestant].totalScore}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Character Authenticity</span>
                    <span>
                      {battleData.scorecards[contestant].characterAuthenticity}
                    </span>
                  </div>
                  <ScoreBar
                    value={
                      battleData.scorecards[contestant].characterAuthenticity
                    }
                    color="bg-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Roast Quality</span>
                    <span>
                      {battleData.scorecards[contestant].roastQuality}
                    </span>
                  </div>
                  <ScoreBar
                    value={battleData.scorecards[contestant].roastQuality}
                    color="bg-red-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Battle Flow</span>
                    <span>{battleData.scorecards[contestant].battleFlow}</span>
                  </div>
                  <ScoreBar
                    value={battleData.scorecards[contestant].battleFlow}
                    color="bg-green-500"
                  />
                </div>
                <div className="pt-2 text-sm italic">
                  <strong>Feedback:</strong>{" "}
                  {battleData.finalRemarks[contestant]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Battle Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Best Burns</h3>
              <div className="space-y-2">
                {battleData.highlights.bestBurns.map((highlight, index) => (
                  <div key={index} className="p-3 bg-gray-100 rounded-lg">
                    <div className="font-medium mb-1">
                      {getContestantName(highlight.character)}:
                    </div>
                    <div className="italic">{highlight.burn}</div>
                  </div>
                ))}
              </div>
            </div>
            {battleData.highlights.bestCallback !== "None" && (
              <div>
                <h3 className="font-semibold mb-2">Best Callback</h3>
                <div className="p-3 bg-gray-100 rounded-lg">
                  {battleData.highlights.bestCallback}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BattleResults;
