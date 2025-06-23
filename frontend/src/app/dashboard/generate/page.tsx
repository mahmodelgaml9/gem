
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import { Business, ContentType as PrismaContentType, MarketingPlan, AudiencePersona } from '@/types';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Loader from '@/components/ui/Loader';
import { Sparkles, Save, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const contentTypeOptions = Object.values(PrismaContentType).map(ct => ({
  value: ct,
  label: (ct as string).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
}));

const toneOptions = [
  { value: 'formal', label: 'Formal' }, { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' }, { value: 'witty', label: 'Witty' },
  { value: 'informative', label: 'Informative' }, { value: 'persuasive', label: 'Persuasive' },
  { value: 'empathetic', label: 'Empathetic'}, { value: 'authoritative', label: 'Authoritative'}
];
const styleOptions = [
  { value: 'direct', label: 'Direct' }, { value: 'narrative', label: 'Narrative' },
  { value: 'conversational', label: 'Conversational' }, { value: 'humorous', label: 'Humorous' },
  { value: 'technical', label: 'Technical Deep-Dive' }, { value: 'storytelling', label: 'Storytelling' },
  { value: 'academic', label: 'Academic'}, { value: 'simple', label: 'Simple & Clear'}
];
const lengthOptions = [
  { value: 'short', label: 'Short (e.g., social media post, headline)' },
  { value: 'medium', label: 'Medium (e.g., short blog section, email body)' },
  { value: 'long', label: 'Long (e.g., article, detailed description)' },
];

interface GenerationFormInputs {
  businessId: string;
  contentType: PrismaContentType;
  customPrompt: string;
  tone?: string;
  style?: string;
  keywords?: string; // Comma-separated
  targetAudienceId?: string;
  marketingPlanId?: string;
  length?: 'short' | 'medium' | 'long';
  contentTitle?: string; // For saving
}

interface StreamMetadata {
    type: 'metadata';
    modelUsed: string;
    promptChars: number;
}
interface StreamChunk {
    type: 'chunk';
    text: string;
}
interface StreamDone {
    type: 'done';
    fullText: string;
    modelUsed: string;
    promptUsed: string;
    contentType: PrismaContentType;
    businessId: string;
    marketingPlanId?: string;
}
interface StreamError {
    type: 'error';
    message: string;
}

type StreamEventData = StreamMetadata | StreamChunk | StreamDone | StreamError;


const GenerateContentPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const searchParams = useSearchParams();
  const defaultBusinessId = searchParams.get('businessId');

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<GenerationFormInputs>({
    defaultValues: {
      businessId: defaultBusinessId || '',
      contentType: PrismaContentType.BLOG_POST,
      length: 'medium',
    }
  });

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [marketingPlans, setMarketingPlans] = useState<MarketingPlan[]>([]);
  const [audiencePersonas, setAudiencePersonas] = useState<AudiencePersona[]>([]);
  
  const [isFetchingBusinesses, setIsFetchingBusinesses] = useState(false);
  const [isFetchingRelated, setIsFetchingRelated] = useState(false);
  
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  const [streamMetadata, setStreamMetadata] = useState<StreamMetadata | null>(null);
  const [finalStreamDataForSave, setFinalStreamDataForSave] = useState<StreamDone | null>(null);
  const generatedContentRef = useRef<HTMLDivElement>(null);

  const watchedBusinessId = watch('businessId');

  // Fetch businesses
  useEffect(() => {
    const fetchUserBusinesses = async () => {
      if (!user) return;
      setIsFetchingBusinesses(true);
      try {
        const response = await apiClient.get<Business[]>('/businesses');
        setBusinesses(response.data || []);
        if (defaultBusinessId && response.data.some(b => b.id === defaultBusinessId)) {
          setValue('businessId', defaultBusinessId);
        } else if (response.data.length > 0) {
          setValue('businessId', response.data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch businesses.');
        console.error(err);
      } finally {
        setIsFetchingBusinesses(false);
      }
    };
    fetchUserBusinesses();
  }, [user, setValue, defaultBusinessId]);

  // Fetch marketing plans and audience personas when businessId changes
  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!watchedBusinessId) {
        setMarketingPlans([]);
        setAudiencePersonas([]);
        return;
      }
      setIsFetchingRelated(true);
      setError(null);
      try {
        // In a real app, you'd fetch these from dedicated endpoints
        // For now, let's assume business object might contain them or you have separate fetches
        // This is a placeholder; actual fetching would be needed.
        // const plansResponse = await apiClient.get(`/marketing-plans?businessId=${watchedBusinessId}`);
        // setMarketingPlans(plansResponse.data);
        // const personasResponse = await apiClient.get(`/audience-personas?businessId=${watchedBusinessId}`);
        // setAudiencePersonas(personasResponse.data);
        console.log(`TODO: Fetch marketing plans and personas for business ${watchedBusinessId}`);
        setMarketingPlans([]); // Placeholder
        setAudiencePersonas([]); // Placeholder
      } catch (err) {
        setError('Failed to fetch related business data (plans/personas).');
        console.error(err);
      } finally {
        setIsFetchingRelated(false);
      }
    };
    fetchRelatedData();
  }, [watchedBusinessId]);

  // Scroll to bottom of generated content
  useEffect(() => {
    if (generatedContentRef.current) {
      generatedContentRef.current.scrollTop = generatedContentRef.current.scrollHeight;
    }
  }, [generatedContent]);


  const onSubmitGeneration: SubmitHandler<GenerationFormInputs> = async (data) => {
    setIsGenerating(true);
    setGeneratedContent('');
    setError(null);
    setSaveSuccess(null);
    setStreamMetadata(null);
    setFinalStreamDataForSave(null);

    const generationParams = {
      ...data,
      keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/content/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify(generationParams),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader.');
      }
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process buffer for SSE messages
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
            const message = buffer.substring(0, boundary);
            buffer = buffer.substring(boundary + 2);
            
            if (message.startsWith('data: ')) {
                const jsonStr = message.substring(6);
                try {
                    const eventData = JSON.parse(jsonStr) as StreamEventData;
                    if (eventData.type === 'metadata') {
                        setStreamMetadata(eventData);
                    } else if (eventData.type === 'chunk') {
                        setGeneratedContent(prev => prev + eventData.text);
                    } else if (eventData.type === 'done') {
                        setFinalStreamDataForSave(eventData);
                        // Optional: if you don't want the last chunk in fullText to be appended via 'chunk' event
                        // setGeneratedContent(eventData.fullText); 
                        setIsGenerating(false); // Mark generation as done
                        reader.cancel(); // Close the stream as we have 'done'
                        return; // Exit loop
                    } else if (eventData.type === 'error') {
                        throw new Error(`Streaming error from server: ${eventData.message}`);
                    }
                } catch (e) {
                    console.error('Failed to parse SSE event data:', jsonStr, e);
                }
            }
            boundary = buffer.indexOf('\n\n');
        }
      }
      // If loop finishes without 'done' event, something might be off or stream ended prematurely
      if (buffer.startsWith('data: ')) { // Process any remaining part of the last message
         const jsonStr = buffer.substring(6);
         try {
            const eventData = JSON.parse(jsonStr) as StreamEventData;
            if (eventData.type === 'done') {
                setFinalStreamDataForSave(eventData);
            }
         } catch(e) { /* ignore parse error on incomplete final message */ }
      }

    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Content generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveContent = async () => {
    if (!finalStreamDataForSave) {
        setError("No content data to save. Please generate content first.");
        return;
    }
    setIsSaving(true);
    setError(null);
    setSaveSuccess(null);

    const { businessId, contentType, fullText, modelUsed, promptUsed, marketingPlanId } = finalStreamDataForSave;
    const title = watch('contentTitle') || `${contentType.replace(/_/g, ' ')} - ${new Date().toLocaleDateString()}`;

    try {
        const payload = {
            businessId,
            contentType,
            title,
            body: fullText,
            promptUsed,
            aiModelUsed: modelUsed,
            marketingPlanId: marketingPlanId || undefined,
        };
        await apiClient.post('/content/save', payload);
        setSaveSuccess('Content saved successfully!');
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to save content.');
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-darkest">Generate Content</h1>
        <p className="mt-1 text-neutral-DEFAULT">
          Craft compelling content tailored to your business needs and strategies.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmitGeneration)} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-xl">
        {/* Basic Options */}
        <section className="space-y-4">
          <Controller
            name="businessId"
            control={control}
            rules={{ required: 'Please select a business.' }}
            render={({ field }) => (
              <Select
                id="businessId"
                label="Target Business*"
                options={businesses.map(b => ({ value: b.id, label: b.name }))}
                placeholder={isFetchingBusinesses ? "Loading businesses..." : "Select a business"}
                error={errors.businessId?.message}
                disabled={isFetchingBusinesses || businesses.length === 0}
                {...field}
              />
            )}
          />

          <Controller
            name="contentType"
            control={control}
            rules={{ required: 'Content type is required.' }}
            render={({ field }) => (
              <Select
                id="contentType"
                label="Content Type*"
                options={contentTypeOptions}
                error={errors.contentType?.message}
                {...field}
              />
            )}
          />
          
          <Textarea
            id="customPrompt"
            label="Main Prompt / Instructions*"
            placeholder="e.g., Write a blog post about the benefits of our new product X for small businesses. Focus on ease of use and affordability."
            rows={5}
            error={errors.customPrompt?.message}
            registration={register('customPrompt', { required: "Prompt is required."})}
          />
        </section>

        {/* Advanced Options Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left text-lg font-semibold text-primary-DEFAULT hover:text-primary-dark"
          >
            Advanced Options
            {showAdvanced ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>

        {/* Advanced Options Fields */}
        {showAdvanced && (
          <section className="space-y-4 pt-4 border-t border-dashed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="tone"
                control={control}
                render={({ field }) => (
                  <Select id="tone" label="Tone" options={toneOptions} placeholder="Default" {...field} />
                )}
              />
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <Select id="style" label="Style" options={styleOptions} placeholder="Default" {...field} />
                )}
              />
            </div>
            <Input
              id="keywords"
              label="Keywords (comma-separated)"
              placeholder="e.g., innovation, SaaS, growth"
              registration={register('keywords')}
            />
            <Controller
                name="length"
                control={control}
                render={({ field }) => (
                  <Select id="length" label="Desired Length" options={lengthOptions} {...field} />
                )}
              />

            {/* TODO: Populate these from fetched data based on selected business */}
            <Controller
              name="targetAudienceId"
              control={control}
              render={({ field }) => (
                <Select
                  id="targetAudienceId"
                  label="Target Audience Persona"
                  options={audiencePersonas.map(p => ({ value: p.id, label: p.name }))}
                  placeholder={isFetchingRelated ? "Loading..." : "Optional: Select Persona"}
                  disabled={isFetchingRelated || audiencePersonas.length === 0}
                  {...field}
                />
              )}
            />
            <Controller
              name="marketingPlanId"
              control={control}
              render={({ field }) => (
                <Select
                  id="marketingPlanId"
                  label="Align with Marketing Plan"
                  options={marketingPlans.map(p => ({ value: p.id, label: p.title }))}
                  placeholder={isFetchingRelated ? "Loading..." : "Optional: Select Plan"}
                  disabled={isFetchingRelated || marketingPlans.length === 0}
                  {...field}
                />
              )}
            />
          </section>
        )}
        
        {error && (
            <div className="p-3 my-4 bg-red-100 text-red-700 rounded-md flex items-start space-x-2">
                <AlertCircle size={20} className="flex-shrink-0"/>
                <p className="text-sm">{error}</p>
            </div>
        )}

        <Button type="submit" className="w-full sm:w-auto" isLoading={isGenerating} disabled={isGenerating || isSaving} leftIcon={<Sparkles size={18}/>}>
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
      </form>

      {/* Generated Content Display */}
      {(generatedContent || streamMetadata || finalStreamDataForSave) && (
        <section className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold text-neutral-darkest mb-4">Generated Content</h2>
          {streamMetadata && (
            <div className="mb-3 text-xs text-neutral-DEFAULT">
                Using model: {streamMetadata.modelUsed} (Prompt: {streamMetadata.promptChars} chars)
            </div>
          )}
          <div 
            ref={generatedContentRef}
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none bg-neutral-lightest p-4 rounded-md min-h-[200px] max-h-[500px] overflow-y-auto whitespace-pre-wrap"
          >
            {generatedContent || (isGenerating ? <Loader message="Waiting for stream..." /> : "No content yet.")}
          </div>

          {finalStreamDataForSave && !isGenerating && (
            <div className="mt-6 space-y-4">
               <Input
                    id="contentTitle"
                    label="Content Title (for saving)"
                    placeholder="Enter a title for this content"
                    registration={register('contentTitle')}
                />
              <Button onClick={handleSaveContent} isLoading={isSaving} disabled={isSaving || isGenerating} leftIcon={<Save size={18}/>}>
                {isSaving ? 'Saving...' : 'Save Content'}
              </Button>
            </div>
          )}
          {saveSuccess && (
            <div className="p-3 my-4 bg-green-100 text-green-700 rounded-md flex items-center space-x-2">
                <CheckCircle size={20} />
                <p className="text-sm">{saveSuccess}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default GenerateContentPage;

