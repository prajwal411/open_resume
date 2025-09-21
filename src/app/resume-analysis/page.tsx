"use client";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeChecker } from "components/ResumeChecker";
import { ResumeAnalysisDashboard } from "components/ResumeChecker/Dashboard";
import { useState } from "react";
import { 
  SparklesIcon, 
  ChartBarIcon,
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";

export default function ResumeAnalysis() {
  const [activeTab, setActiveTab] = useState<'checker' | 'dashboard'>('checker');

  return (
    <Provider store={store}>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <a 
                  href="/resume-builder" 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back to Resume Builder</span>
                </a>
                <div className="h-6 border-l border-gray-300" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Resume Analysis Center
                </h1>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('checker')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === 'checker'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <SparklesIcon className="h-4 w-4" />
                  Resume Checker
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'checker' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Automated Resume Relevance Check
                </h2>
                <p className="text-gray-600">
                  Analyze your resume against specific job requirements and get personalized improvement feedback.
                </p>
              </div>
              <ResumeChecker />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis Dashboard
                </h2>
                <p className="text-gray-600">
                  Track your resume analysis history and view detailed insights from previous evaluations.
                </p>
              </div>
              <ResumeAnalysisDashboard />
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automated Resume Relevance Check Features
              </h3>
              <p className="text-gray-600">
                Our comprehensive system evaluates your resume against job requirements
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Automated Evaluation</h4>
                <p className="text-sm text-gray-600">
                  Scale resume evaluation against job requirements automatically
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Relevance Scoring</h4>
                <p className="text-sm text-gray-600">
                  Generate 0-100 relevance scores for each resume per job role
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Gap Analysis</h4>
                <p className="text-sm text-gray-600">
                  Highlight missing skills, certifications, or project experience
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Fit Verdict</h4>
                <p className="text-sm text-gray-600">
                  Provide High/Medium/Low suitability verdicts to recruiters
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Improvement Feedback</h4>
                <p className="text-sm text-gray-600">
                  Offer personalized improvement suggestions to students
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Dashboard Access</h4>
                <p className="text-sm text-gray-600">
                  Store evaluations in web dashboard for placement team access
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Provider>
  );
}

// Import additional icons that are used
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  AcademicCapIcon, 
  UsersIcon 
} from "@heroicons/react/24/outline";