
'use client';

import React from 'react';
import { LibraryBig } from 'lucide-react'; // Example Icon

// TODO: Fetch and display generated content
// Types for content would be needed, e.g., from @/types

const ContentLibraryPage: React.FC = () => {
  // const [contents, setContents] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   fetch content from backend
  //   apiClient.get('/content')
  //     .then(response => {
  //       setContents(response.data);
  //       setIsLoading(false);
  //     })
  //     .catch(err => {
  //       setError(err.message || 'Failed to load content library.');
  //       setIsLoading(false);
  //     });
  // }, []);

  // if (isLoading) return <Loader fullScreen message="Loading content library..." />;
  // if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-darkest">Content Library</h1>
        <p className="mt-1 text-neutral-DEFAULT">
          Review, edit, and manage all your AI-generated content in one place.
        </p>
      </header>

      <div className="bg-white p-8 rounded-xl shadow-xl text-center">
        <LibraryBig size={64} className="mx-auto text-primary-DEFAULT mb-6" />
        <h2 className="text-2xl font-semibold text-neutral-darkest mb-3">
          Content Library Coming Soon!
        </h2>
        <p className="text-neutral-DEFAULT max-w-md mx-auto">
          This section will soon allow you to browse, search, and manage all the content
          you've generated using the platform. Stay tuned for updates!
        </p>
        {/* Placeholder for content list/table */}
        {/* {contents.length === 0 ? (
          <p>No content generated yet. Go to "Generate Content" to create some!</p>
        ) : (
          <ul>
            {contents.map(content => (
              <li key={content.id}>{content.title || 'Untitled Content'}</li>
            ))}
          </ul>
        )} */}
      </div>
    </div>
  );
};

export default ContentLibraryPage;
