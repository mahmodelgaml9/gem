
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import apiClient from '@/lib/axios';
import { Business } from '@/types'; // Assuming Business type is defined
import { PlusCircle, Edit3, Trash2, Search, BarChart3, BrainCircuit, FileText, BriefcaseBusiness } from 'lucide-react';
import Input from '@/components/ui/Input'; // Assuming you have an Input component

// Modal for creating/editing business
const BusinessModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Business>) => void;
  initialData?: Business | null;
  isLoading: boolean;
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [industry, setIndustry] = useState(initialData?.industry || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || '');
  const [description, setDescription] = useState(initialData?.description || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setIndustry(initialData.industry || '');
      setWebsiteUrl(initialData.websiteUrl || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setIndustry('');
      setWebsiteUrl('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: initialData?.id, name, industry, websiteUrl, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all">
        <h3 className="text-xl font-semibold mb-4 text-neutral-darkest">
          {initialData ? 'Edit Business' : 'Add New Business'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="bus-name" label="Business Name*" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" required />
          <Input id="bus-industry" label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology" />
          <Input id="bus-website" label="Website URL" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
          <textarea
            id="bus-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your business..."
            rows={3}
            className="block w-full appearance-none rounded-md border border-neutral-light px-3 py-2 placeholder-neutral-DEFAULT shadow-sm focus:border-primary-DEFAULT focus:outline-none focus:ring-1 focus:ring-primary-DEFAULT sm:text-sm"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Business')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


const MyBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Business[]>('/businesses');
      setBusinesses(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch businesses.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleOpenModal = (business?: Business) => {
    setEditingBusiness(business || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBusiness(null);
  };

  const handleSubmitBusiness = async (data: Partial<Business>) => {
    setModalLoading(true);
    try {
      if (editingBusiness && editingBusiness.id) {
        // Update existing business
        await apiClient.put(`/businesses/${editingBusiness.id}`, data);
      } else {
        // Create new business
        await apiClient.post('/businesses', data);
      }
      await fetchBusinesses(); // Refresh list
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed. Please try again.');
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };
  
  const handleDeleteBusiness = async (businessId: string) => {
    if (window.confirm("Are you sure you want to delete this business and all its related data? This action cannot be undone.")) {
      try {
        await apiClient.delete(`/businesses/${businessId}`);
        await fetchBusinesses(); // Refresh list
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete business.');
        console.error(err);
      }
    }
  };
  
  // TODO: Add actual analysis and plan generation triggering functions
  const handleAnalyze = (business: Business) => {
    alert(`Initiating analysis for ${business.name} (URL: ${business.websiteUrl}). This will be implemented fully soon.`);
    // Example call: apiClient.post('/strategy/analyze-business', { businessId: business.id, websiteUrl: business.websiteUrl });
  };
  const handleGeneratePlan = (businessId: string) => {
    alert(`Plan generation for business ID ${businessId} will be implemented soon. This typically requires a completed analysis first.`);
  };


  if (isLoading) return <Loader fullScreen message="Loading your businesses..." />;
  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-darkest">My Businesses</h1>
        <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18}/>}>
          Add New Business
        </Button>
      </header>

      {/* Optional: Search/Filter bar */}
      {/* <div className="bg-white p-4 rounded-lg shadow"> ... </div> */}

      {businesses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BriefcaseBusiness size={48} className="mx-auto text-neutral-DEFAULT mb-4" />
          <h2 className="text-xl font-semibold text-neutral-darkest">No Businesses Yet</h2>
          <p className="text-neutral-DEFAULT mt-2 mb-4">
            Add your first business to start analyzing and generating content.
          </p>
          <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle size={18}/>}>
            Add Your First Business
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold text-primary-dark mb-1">{business.name}</h3>
                {business.industry && <p className="text-sm text-secondary-DEFAULT mb-1">{business.industry}</p>}
                {business.websiteUrl && (
                  <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-DEFAULT hover:underline block truncate mb-3">
                    {business.websiteUrl}
                  </a>
                )}
                <p className="text-sm text-neutral-DEFAULT mb-4 line-clamp-3 min-h-[3.5rem]">
                  {business.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="border-t border-neutral-light p-4 space-y-2">
                 <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleAnalyze(business)} leftIcon={<Search size={16}/>} disabled={!business.websiteUrl}>
                   Analyze Website
                </Button>
                 <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => alert('View Analyses - Not implemented')} leftIcon={<BarChart3 size={16}/>}>
                   View Analyses
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleGeneratePlan(business.id)} leftIcon={<BrainCircuit size={16}/>}>
                   Generate Plan
                </Button>
                 <Link href={`/dashboard/generate?businessId=${business.id}`} className="block">
                    <Button variant="secondary" size="sm" className="w-full justify-start" leftIcon={<FileText size={16}/>}>
                        Generate Content
                    </Button>
                </Link>
              </div>

              <div className="bg-neutral-lightest p-3 flex justify-end space-x-2 border-t">
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(business)} aria-label="Edit Business">
                  <Edit3 size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => handleDeleteBusiness(business.id)} aria-label="Delete Business">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <BusinessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBusiness}
        initialData={editingBusiness}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default MyBusinessesPage;
