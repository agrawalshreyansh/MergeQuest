export default function ProjectCard({ project }) {
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      Ruby: '#701516',
      PHP: '#4F5D95',
      Swift: '#F05138',
      Kotlin: '#A97BFF',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#178600',
      React: '#61dafb',
    };
    return colors[language] || '#8b5cf6';
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getTimeSinceUpdate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Generate gradient based on project name or id
  const getGradient = () => {
    const gradients = [
      'from-teal-600 to-teal-800',
      'from-blue-500 to-blue-700',
      'from-green-500 to-green-700',
      'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700',
      'from-indigo-500 to-indigo-700',
      'from-cyan-500 to-cyan-700',
      'from-emerald-500 to-emerald-700',
    ];
    const index = (project.id || 0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="bg-[#2a2a3e] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 flex flex-col">
      {/* Project Icon/Header */}
      <div className={`h-32 bg-gradient-to-br ${getGradient()} flex items-center justify-center`}>
        <div className="text-white text-6xl font-bold opacity-90">
          {(project.name || 'P').charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-2 truncate">
          {project.name || 'Unnamed Project'}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
          {project.description || 'No description available'}
        </p>

        {/* Metrics */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-yellow-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white">{formatNumber(project.stars || project.stargazers_count || 0)}</span>
          </div>

          {project.language && (
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getLanguageColor(project.language) }}
              />
              <span className="text-purple-400 text-xs font-medium">{project.language}</span>
            </div>
          )}
        </div>

        {/* Good First Issues Badge */}
        {(project.good_first_issues || project.goodFirstIssuesCount) > 0 && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {project.good_first_issues || project.goodFirstIssuesCount} good first issue{(project.good_first_issues || project.goodFirstIssuesCount) !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-500 mb-4">
          Updated {getTimeSinceUpdate(project.updated_at || project.last_updated)}
        </div>

        {/* View Project Button */}
        <a
          href={project.url || project.html_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium transition-colors"
        >
          View Project
        </a>
      </div>
    </div>
  );
}
