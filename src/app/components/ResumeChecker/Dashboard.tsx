"use client";
import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  DocumentTextIcon,
  UsersIcon,
  TrophyIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface AnalysisHistoryItem {
  score: number;
  fitLevel: string;
  jobTitle: string;
  jobCompany: string;
  timestamp: string;
  gaps: any[];
  strengths: string[];
  improvementFeedback: string[];
}

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  highFitCount: number;
  recentAnalyses: AnalysisHistoryItem[];
}

export const ResumeAnalysisDashboard: React.FC = () => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    averageScore: 0,
    highFitCount: 0,
    recentAnalyses: []
  });

  // Load analysis history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('resumeAnalysisHistory') || '[]');
    setAnalysisHistory(history);
    
    // Calculate stats
    const totalAnalyses = history.length;
    const averageScore = totalAnalyses > 0 
      ? Math.round(history.reduce((sum: number, item: AnalysisHistoryItem) => sum + item.score, 0) / totalAnalyses)
      : 0;
    const highFitCount = history.filter((item: AnalysisHistoryItem) => item.fitLevel === 'High').length;
    const recentAnalyses = history.slice(-5).reverse();

    setStats({
      totalAnalyses,
      averageScore,
      highFitCount,
      recentAnalyses
    });
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('resumeAnalysisHistory');
    setAnalysisHistory([]);
    setSelectedAnalysis(null);
    setStats({
      totalAnalyses: 0,
      averageScore: 0,
      highFitCount: 0,
      recentAnalyses: []
    });
  };

  const deleteAnalysis = (index: number) => {
    const updatedHistory = analysisHistory.filter((_, i) => i !== index);
    localStorage.setItem('resumeAnalysisHistory', JSON.stringify(updatedHistory));
    setAnalysisHistory(updatedHistory);
    
    if (selectedAnalysis === analysisHistory[index]) {
      setSelectedAnalysis(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFitLevelColor = (fitLevel: string) => {
    switch (fitLevel) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Resume Analysis Dashboard
          </h2>
        </div>
        {analysisHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            Clear History
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Analyses</p>
              <p className="text-3xl font-bold">{stats.totalAnalyses}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Average Score</p>
              <p className="text-3xl font-bold">{stats.averageScore}/100</p>
            </div>
            <TrophyIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">High Fit Jobs</p>
              <p className="text-3xl font-bold">{stats.highFitCount}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Analysis History */}
      {analysisHistory.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
          <p className="text-gray-600">
            Start by checking your resume relevance against job profiles to see your analysis history here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Analysis History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analysisHistory.map((analysis, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAnalysis === analysis
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{analysis.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{analysis.jobCompany}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnalysis(index);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${getFitLevelColor(analysis.fitLevel)}`}>
                      {analysis.fitLevel} Fit
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3" />
                      {new Date(analysis.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed View */}
          <div>
            {selectedAnalysis ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <EyeIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Analysis Details</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Job Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{selectedAnalysis.jobTitle}</h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedAnalysis.jobCompany}</p>
                    <p className="text-xs text-gray-500">
                      Analyzed on {new Date(selectedAnalysis.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Relevance Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.score)}`}>
                        {selectedAnalysis.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedAnalysis.score >= 80 ? 'bg-green-500' :
                          selectedAnalysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedAnalysis.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Strengths */}
                  {selectedAnalysis.strengths && selectedAnalysis.strengths.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.strengths.map((strength, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gaps */}
                  {selectedAnalysis.gaps && selectedAnalysis.gaps.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">Identified Gaps</h5>
                      <div className="space-y-2">
                        {selectedAnalysis.gaps.map((gap, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium capitalize">{gap.category}:</span>
                            <span className="ml-1 text-gray-600">
                              {gap.missing.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Feedback */}
                  {selectedAnalysis.improvementFeedback && selectedAnalysis.improvementFeedback.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">Improvement Suggestions</h5>
                      <ul className="space-y-1">
                        {selectedAnalysis.improvementFeedback.slice(0, 3).map((feedback, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Select an analysis from the history to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Placement Team Access Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <UsersIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Placement Team Dashboard</h4>
            <p className="text-sm text-blue-700 mt-1">
              All resume evaluations are automatically stored and accessible to the placement team for recruitment decisions. 
              This dashboard provides comprehensive analytics on student resume quality and job fit assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};