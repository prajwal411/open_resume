"use client";
import React, { useState, useCallback, useEffect } from 'react';
import {
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BoltIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import type { Resume } from "lib/redux/types";

// Job role definitions for matching
const JOB_ROLES = {
  'frontend-developer': {
    title: 'Frontend Developer',
    keywords: {
      skills: ['react', 'javascript', 'html', 'css', 'typescript', 'vue', 'angular', 'sass', 'tailwind', 'bootstrap'],
      experience: ['frontend', 'ui', 'web development', 'user interface', 'responsive'],
      tools: ['git', 'webpack', 'npm', 'yarn', 'figma', 'adobe xd'],
      weight: { skills: 40, experience: 35, education: 15, projects: 10 }
    }
  },
  'backend-developer': {
    title: 'Backend Developer', 
    keywords: {
      skills: ['node.js', 'python', 'java', 'api', 'database', 'sql', 'mongodb', 'express', 'django', 'spring'],
      experience: ['backend', 'server', 'api development', 'database design', 'microservices'],
      tools: ['docker', 'kubernetes', 'aws', 'azure', 'postman', 'jenkins'],
      weight: { skills: 45, experience: 30, education: 15, projects: 10 }
    }
  },
  'fullstack-developer': {
    title: 'Full Stack Developer',
    keywords: {
      skills: ['react', 'node.js', 'javascript', 'python', 'database', 'api', 'html', 'css', 'mongodb', 'sql'],
      experience: ['fullstack', 'full stack', 'web development', 'frontend', 'backend'],
      tools: ['git', 'docker', 'aws', 'heroku', 'postman'],
      weight: { skills: 40, experience: 30, education: 15, projects: 15 }
    }
  },
  'data-scientist': {
    title: 'Data Scientist',
    keywords: {
      skills: ['python', 'r', 'machine learning', 'data analysis', 'statistics', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'sql'],
      experience: ['data science', 'machine learning', 'analytics', 'research', 'modeling'],
      tools: ['jupyter', 'tableau', 'power bi', 'excel', 'spark'],
      weight: { skills: 45, experience: 25, education: 25, projects: 5 }
    }
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    keywords: {
      skills: ['docker', 'kubernetes', 'aws', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'linux', 'bash', 'python'],
      experience: ['devops', 'cloud', 'infrastructure', 'deployment', 'automation'],
      tools: ['git', 'monitoring', 'prometheus', 'grafana', 'elk'],
      weight: { skills: 50, experience: 30, education: 10, projects: 10 }
    }
  }
};

interface RelevanceScore {
  overall: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
  };
  accuracy: number;
  confidence: 'High' | 'Medium' | 'Low';
  matchedKeywords: string[];
  missingKeywords: string[];
}

interface RelevanceScoreDisplayProps {
  resume: Resume;
  className?: string;
  isLoading?: boolean;
}

export const RelevanceScoreDisplay: React.FC<RelevanceScoreDisplayProps> = ({ 
  resume, 
  className = "",
  isLoading = false
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('frontend-developer');
  const [score, setScore] = useState<RelevanceScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Function to extract text from resume
  const extractResumeText = useCallback((resume: Resume): string => {
    const allText = [
      resume.profile.name,
      resume.profile.summary,
      resume.profile.email,
      resume.profile.location,
      ...resume.workExperiences.flatMap(exp => [
        exp.company,
        exp.jobTitle,
        ...exp.descriptions
      ]),
      ...resume.educations.flatMap(edu => [
        edu.school,
        edu.degree,
        ...edu.descriptions
      ]),
      ...resume.projects.flatMap(proj => [
        proj.project,
        ...proj.descriptions
      ]),
      ...resume.skills.descriptions,
      ...resume.skills.featuredSkills.map(skill => skill.skill)
    ].filter(Boolean).join(' ').toLowerCase();

    return allText;
  }, []);

  // Function to calculate relevance score
  const calculateRelevanceScore = useCallback((resume: Resume, roleKey: string): RelevanceScore => {
    const role = JOB_ROLES[roleKey as keyof typeof JOB_ROLES];
    const resumeText = extractResumeText(resume);
    
    let totalScore = 0;
    let maxScore = 100;
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    
    // Calculate skills match
    const skillsMatched = role.keywords.skills.filter(skill => {
      const matched = resumeText.includes(skill.toLowerCase());
      if (matched) matchedKeywords.push(skill);
      else missingKeywords.push(skill);
      return matched;
    }).length;
    
    const skillsScore = (skillsMatched / role.keywords.skills.length) * 100;
    
    // Calculate experience match
    const experienceMatched = role.keywords.experience.filter(exp => {
      const matched = resumeText.includes(exp.toLowerCase());
      if (matched) matchedKeywords.push(exp);
      else missingKeywords.push(exp);
      return matched;
    }).length;
    
    const experienceScore = (experienceMatched / role.keywords.experience.length) * 100;
    
    // Calculate tools match
    const toolsMatched = role.keywords.tools.filter(tool => {
      const matched = resumeText.includes(tool.toLowerCase());
      if (matched) matchedKeywords.push(tool);
      else missingKeywords.push(tool);
      return matched;
    }).length;
    
    const toolsScore = (toolsMatched / role.keywords.tools.length) * 100;
    
    // Calculate education relevance (simplified)
    const educationScore = resume.educations.some(edu => 
      edu.degree.toLowerCase().includes('computer') || 
      edu.degree.toLowerCase().includes('engineering') ||
      edu.degree.toLowerCase().includes('science') ||
      edu.degree.toLowerCase().includes('technology')
    ) ? 80 : 40;
    
    // Calculate projects relevance
    const projectsScore = resume.projects.length > 0 ? 
      Math.min(resume.projects.length * 30, 100) : 20;
    
    // Weighted overall score
    const weights = role.keywords.weight;
    const overall = Math.round(
      (skillsScore * weights.skills + 
       experienceScore * weights.experience + 
       educationScore * weights.education + 
       projectsScore * weights.projects) / 100
    );
    
    // Calculate accuracy based on resume completeness
    const completenessFactors = [
      resume.profile.name ? 1 : 0,
      resume.profile.email ? 1 : 0,
      resume.profile.summary ? 1 : 0,
      resume.workExperiences.length > 0 ? 1 : 0,
      resume.educations.length > 0 ? 1 : 0,
      resume.skills.descriptions.length > 0 || resume.skills.featuredSkills.some(s => s.skill) ? 1 : 0
    ];
    
    const accuracy = Math.round((completenessFactors.reduce((a, b) => a + b, 0) / completenessFactors.length) * 100);
    
    // Determine confidence based on accuracy and data quality
    let confidence: 'High' | 'Medium' | 'Low';
    if (accuracy >= 85) confidence = 'High';
    else if (accuracy >= 65) confidence = 'Medium';
    else confidence = 'Low';

    return {
      overall,
      breakdown: {
        skills: Math.round(skillsScore),
        experience: Math.round(experienceScore),
        education: Math.round(educationScore),
        projects: Math.round(projectsScore)
      },
      accuracy,
      confidence,
      matchedKeywords: Array.from(new Set(matchedKeywords)), // Remove duplicates
      missingKeywords: Array.from(new Set(missingKeywords.slice(0, 10))) // Limit to top 10
    };
  }, [extractResumeText]);

  // Calculate score when resume or role changes
  useEffect(() => {
    if (!resume || !resume.profile.name) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    const timer = setTimeout(() => {
      const newScore = calculateRelevanceScore(resume, selectedRole);
      setScore(newScore);
      setIsCalculating(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [resume, selectedRole, calculateRelevanceScore]);

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get confidence display
  const getConfidenceDisplay = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircleIcon className="h-4 w-4" />
        };
      case 'Medium':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />
        };
      case 'Low':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <XCircleIcon className="h-4 w-4" />
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <CogIcon className="h-4 w-4" />
        };
    }
  };

  if (!resume.profile.name && !isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <BoltIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Relevance Score will appear after resume is parsed</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Resume Relevance Score</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium">Parsing resume...</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Extracting text and analyzing content for scoring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Resume Relevance Score</h3>
          </div>
          <div className="flex items-center gap-2">
            <BoltIcon className="h-4 w-4" />
            <span className="text-sm">AI-Powered Analysis</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Job Role Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Job Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(JOB_ROLES).map(([key, role]) => (
              <option key={key} value={key}>
                {role.title}
              </option>
            ))}
          </select>
        </div>

        {isCalculating ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Calculating relevance score...</span>
            </div>
          </div>
        ) : score ? (
          <div className="space-y-4">
            {/* Main Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Score */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Overall Score</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
                  {score.overall}/100
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      score.overall >= 80 ? 'bg-green-500' :
                      score.overall >= 60 ? 'bg-yellow-500' :
                      score.overall >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score.overall}%` }}
                  ></div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">Accuracy</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(score.accuracy)}`}>
                  {score.accuracy}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on data completeness
                </div>
              </div>

              {/* Confidence */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BoltIcon className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-700">Confidence</span>
                </div>
                <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full border ${getConfidenceDisplay(score.confidence).color}`}>
                  {getConfidenceDisplay(score.confidence).icon}
                  <span className="font-semibold">{score.confidence}</span>
                </div>
              </div>
            </div>

            {/* Breakdown Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(score.breakdown).map(([category, value]) => (
                <div key={category} className="text-center p-3 border rounded-lg">
                  <div className="text-sm font-medium text-gray-600 capitalize mb-1">
                    {category}
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(value)}`}>
                    {value}%
                  </div>
                </div>
              ))}
            </div>

            {/* Matched Keywords */}
            {score.matchedKeywords.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">
                  ✅ Matched Keywords ({score.matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {score.matchedKeywords.slice(0, 15).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {score.matchedKeywords.length > 15 && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                      +{score.matchedKeywords.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {score.missingKeywords.length > 0 && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">
                  ⚠️ Missing Keywords (Top {Math.min(score.missingKeywords.length, 10)})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {score.missingKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};