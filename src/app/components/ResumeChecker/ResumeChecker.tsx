"use client";
import React, { useState, useCallback } from 'react';
import { useAppSelector } from 'lib/redux/hooks';
import { selectResume } from 'lib/redux/resumeSlice';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Types for our resume checking system
interface JobRequirement {
  id: string;
  title: string;
  category: 'skills' | 'experience' | 'education' | 'certification' | 'project';
  required: boolean;
  keywords: string[];
  weight: number; // 1-10 importance scale
}

interface GapAnalysis {
  category: string;
  missing: string[];
  suggestions: string[];
  severity: 'low' | 'medium' | 'high';
}

interface RelevanceResult {
  score: number; // 0-100
  fitLevel: 'Low' | 'Medium' | 'High';
  gaps: GapAnalysis[];
  strengths: string[];
  improvementFeedback: string[];
  matchedRequirements: string[];
  timestamp: Date;
  resumeData: any;
}

interface JobProfile {
  id: string;
  title: string;
  company: string;
  requirements: JobRequirement[];
}

// Sample job profiles for demonstration
const SAMPLE_JOB_PROFILES: JobProfile[] = [
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    company: 'Tech Corp',
    requirements: [
      {
        id: 'react',
        title: 'React.js',
        category: 'skills',
        required: true,
        keywords: ['react', 'reactjs', 'jsx', 'hooks'],
        weight: 9
      },
      {
        id: 'javascript',
        title: 'JavaScript',
        category: 'skills',
        required: true,
        keywords: ['javascript', 'js', 'es6', 'typescript'],
        weight: 10
      },
      {
        id: 'css',
        title: 'CSS/Styling',
        category: 'skills',
        required: true,
        keywords: ['css', 'sass', 'tailwind', 'styled-components', 'bootstrap'],
        weight: 7
      },
      {
        id: 'experience',
        title: '2+ Years Experience',
        category: 'experience',
        required: true,
        keywords: ['frontend', 'web development', 'ui'],
        weight: 8
      }
    ]
  },
  {
    id: 'fullstack-dev',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    requirements: [
      {
        id: 'react-node',
        title: 'React & Node.js',
        category: 'skills',
        required: true,
        keywords: ['react', 'node.js', 'nodejs', 'express'],
        weight: 10
      },
      {
        id: 'database',
        title: 'Database Management',
        category: 'skills',
        required: true,
        keywords: ['mongodb', 'mysql', 'postgresql', 'database'],
        weight: 8
      },
      {
        id: 'aws',
        title: 'Cloud Services',
        category: 'skills',
        required: false,
        keywords: ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
        weight: 6
      }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    company: 'Analytics Inc',
    requirements: [
      {
        id: 'python',
        title: 'Python',
        category: 'skills',
        required: true,
        keywords: ['python', 'pandas', 'numpy', 'scikit-learn'],
        weight: 10
      },
      {
        id: 'ml',
        title: 'Machine Learning',
        category: 'skills',
        required: true,
        keywords: ['machine learning', 'deep learning', 'tensorflow', 'pytorch'],
        weight: 9
      },
      {
        id: 'degree',
        title: 'Statistics/CS Degree',
        category: 'education',
        required: true,
        keywords: ['statistics', 'computer science', 'mathematics', 'data science'],
        weight: 8
      }
    ]
  }
];

export const ResumeChecker: React.FC = () => {
  const resume = useAppSelector(selectResume);
  const [selectedJob, setSelectedJob] = useState<JobProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RelevanceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');

  // Function to extract text from resume for analysis
  const extractResumeText = useCallback(() => {
    const { profile, workExperiences, educations, projects, skills } = resume;
    
    const text = [
      profile.name,
      profile.summary,
      profile.email,
      profile.location,
      ...workExperiences.flatMap(exp => [
        exp.company,
        exp.jobTitle,
        ...exp.descriptions
      ]),
      ...educations.flatMap(edu => [
        edu.school,
        edu.degree,
        ...edu.descriptions
      ]),
      ...projects.flatMap(proj => [
        proj.project,
        ...proj.descriptions
      ]),
      ...skills.descriptions,
      ...skills.featuredSkills.map(skill => skill.skill)
    ].filter(Boolean).join(' ').toLowerCase();

    return text;
  }, [resume]);

  // Function to calculate relevance score
  const calculateRelevanceScore = useCallback((jobProfile: JobProfile): RelevanceResult => {
    const resumeText = extractResumeText();
    let totalScore = 0;
    let maxPossibleScore = 0;
    const gaps: GapAnalysis[] = [];
    const strengths: string[] = [];
    const matchedRequirements: string[] = [];
    const improvementFeedback: string[] = [];

    // Analyze each job requirement
    jobProfile.requirements.forEach(requirement => {
      maxPossibleScore += requirement.weight;
      
      const matched = requirement.keywords.some(keyword => 
        resumeText.includes(keyword.toLowerCase())
      );

      if (matched) {
        totalScore += requirement.weight;
        strengths.push(requirement.title);
        matchedRequirements.push(requirement.title);
      } else {
        // Add to gaps
        const existingGap = gaps.find(gap => gap.category === requirement.category);
        if (existingGap) {
          existingGap.missing.push(requirement.title);
          if (requirement.required) {
            existingGap.severity = 'high';
          }
        } else {
          gaps.push({
            category: requirement.category,
            missing: [requirement.title],
            suggestions: getSuggestions(requirement),
            severity: requirement.required ? 'high' : 'medium'
          });
        }

        // Add improvement feedback
        if (requirement.required) {
          improvementFeedback.push(
            `Add ${requirement.title} to your ${requirement.category} section - this is a required skill.`
          );
        } else {
          improvementFeedback.push(
            `Consider adding ${requirement.title} to strengthen your profile for this role.`
          );
        }
      }
    });

    const score = Math.round((totalScore / maxPossibleScore) * 100);
    let fitLevel: 'Low' | 'Medium' | 'High';

    if (score >= 80) fitLevel = 'High';
    else if (score >= 60) fitLevel = 'Medium';
    else fitLevel = 'Low';

    return {
      score,
      fitLevel,
      gaps,
      strengths,
      improvementFeedback,
      matchedRequirements,
      timestamp: new Date(),
      resumeData: resume
    };
  }, [resume, extractResumeText]);

  // Function to get suggestions based on requirement type
  const getSuggestions = (requirement: JobRequirement): string[] => {
    switch (requirement.category) {
      case 'skills':
        return [
          'Add this skill to your Featured Skills section',
          'Mention projects where you used this technology',
          'Include relevant coursework or certifications'
        ];
      case 'experience':
        return [
          'Highlight relevant work experience',
          'Include internships or freelance projects',
          'Mention volunteer work in this area'
        ];
      case 'education':
        return [
          'Add relevant degree or certification',
          'Include online courses or bootcamps',
          'Mention self-study projects'
        ];
      case 'certification':
        return [
          'Obtain industry-recognized certification',
          'Include completion certificates from online courses',
          'Add professional development activities'
        ];
      case 'project':
        return [
          'Create a project demonstrating this skill',
          'Contribute to open source projects',
          'Build a portfolio showcasing your work'
        ];
      default:
        return ['Consider adding this to your resume'];
    }
  };

  // Function to handle resume analysis
  const handleAnalyzeResume = async (jobProfile: JobProfile) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = calculateRelevanceScore(jobProfile);
    setAnalysisResult(result);
    setIsAnalyzing(false);

    // Store result (in real app, this would be sent to backend)
    localStorage.setItem('resumeAnalysisHistory', JSON.stringify([
      ...JSON.parse(localStorage.getItem('resumeAnalysisHistory') || '[]'),
      { ...result, jobTitle: jobProfile.title, jobCompany: jobProfile.company }
    ]));
  };

  // Function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Function to get fit level color and icon
  const getFitLevelDisplay = (fitLevel: string) => {
    switch (fitLevel) {
      case 'High':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircleIcon className="h-5 w-5" />
        };
      case 'Medium':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <ExclamationTriangleIcon className="h-5 w-5" />
        };
      case 'Low':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <XCircleIcon className="h-5 w-5" />
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <DocumentTextIcon className="h-5 w-5" />
        };
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Automated Resume Relevance Check
        </h2>
      </div>

      {/* Job Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Job Profile to Analyze Against:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_JOB_PROFILES.map(job => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedJob?.id === job.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{job.title}</h4>
              <p className="text-sm text-gray-600">{job.company}</p>
              <p className="text-xs text-gray-500 mt-1">
                {job.requirements.length} requirements
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      {selectedJob && (
        <div className="mb-6">
          <button
            onClick={() => handleAnalyzeResume(selectedJob)}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChartBarIcon className="h-5 w-5" />
            {isAnalyzing ? 'Analyzing Resume...' : 'Check Resume Relevance'}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Score and Fit Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Relevance Score</h3>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(analysisResult.score)}`}>
                {analysisResult.score}/100
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${
                    analysisResult.score >= 80 ? 'bg-green-500' :
                    analysisResult.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisResult.score}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Fit Verdict</h3>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getFitLevelDisplay(analysisResult.fitLevel).color}`}>
                {getFitLevelDisplay(analysisResult.fitLevel).icon}
                <span className="font-semibold">{analysisResult.fitLevel} Suitability</span>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {analysisResult.strengths.length > 0 && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gaps Analysis */}
          {analysisResult.gaps.length > 0 && (
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Identified Gaps
              </h3>
              <div className="space-y-4">
                {analysisResult.gaps.map((gap, index) => (
                  <div key={index} className="border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {gap.category} Gaps
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        gap.severity === 'high' ? 'bg-red-200 text-red-800' :
                        gap.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {gap.severity} priority
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Missing:</p>
                      <div className="flex flex-wrap gap-1">
                        {gap.missing.map((item, idx) => (
                          <span key={idx} className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Suggestions:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {gap.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-600 mt-0.5">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Feedback */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5" />
              Personalized Improvement Feedback
            </h3>
            <div className="space-y-2">
              {analysisResult.improvementFeedback.map((feedback, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">💡</span>
                  <p className="text-sm text-gray-700">{feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Timestamp */}
          <div className="text-sm text-gray-500 text-center">
            Analysis completed on {analysisResult.timestamp.toLocaleString()}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Analyzing your resume against job requirements...</span>
          </div>
        </div>
      )}
    </div>
  );
};