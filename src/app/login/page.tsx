'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Added XMarkIcon for modal close
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { login, setToken, setUser } from '@/store/slices/authSlice';
import { setConnectionStatus } from '@/store/slices/jiraSlice';
import { AppDispatch, RootState } from '@/store/store';
import { API_URL } from '@/utils/config';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

// --- New TypeScript Interfaces for Site Selection ---
interface JiraSite {
    cloud_id: string;
    site_name: string;
}

interface SelectionState {
    sites: JiraSite[];
    temp_key: string;
    user_id: string;
}
// --- End Interfaces ---


export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    // New state for handling site selection modal
    const [selectionData, setSelectionData] = useState<SelectionState | null>(null);
    const [selectedCloudId, setSelectedCloudId] = useState<string>('');


    const { register, handleSubmit } = useForm<LoginFormData>();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const { user } = useSelector((state: RootState) => state.auth);

    // --- New Function: Finalize the integration after selection ---
    const finalizeIntegration = useCallback(async (cloudId: string, tempKey: string) => {
        try {
            // 1. Call the backend POST endpoint
            const finalResponse = await fetch(`${API_URL}/jira/select-site`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cloud_id: cloudId,
                    temp_key: tempKey // This key identifies the temporary session/token
                })
            });

            const finalData = await finalResponse.json();

            if (finalResponse.ok) {
                console.log("Jira Connection Finalized:", finalData);
                
                // 2. Update Redux state with the final token AND user_id
                if (finalData.token) {
                    dispatch(setToken(finalData.token));
                }
                if(finalData.user_id){
                    dispatch(setUser({ user_id: finalData.user_id, name: finalData.name || '' }));
                }

                dispatch(setConnectionStatus(true));
                
                // 3. Clear selection state and redirect
                setSelectionData(null);
                router.push('/jira-projects'); 
            } else {
                console.error('Failed to finalize Jira connection:', finalData.error);
                alert(`Failed to connect: ${finalData.error}`);
                setSelectionData(null); // Clear state on error
            }
            
        } catch (error) {
            console.error('API call to finalize connection failed:', error);
            alert("An error occurred during site selection.");
            setSelectionData(null); // Clear state on error
        }
    }, [dispatch, router]);


    useEffect(() => {
        // Listen for messages from the Jira OAuth popup
        const handleMessage = async (event: MessageEvent) => {
            // Simple validation
            if (!event.data || typeof event.data.status !== 'string') {
                return;
            }

            const { status, token, user_id, sites, temp_key } = event.data;
            const popup = event.source as Window;
            
            if (status === 'oauth_success') {
                // ✅ CASE 1: Single site found, or selection successfully completed by another process.
                console.log("Jira OAuth Success:", event.data);
                if (token) {
                    dispatch(setToken(token));
                }
                if(user_id){
                    dispatch(setUser({ user_id: user_id, name: event.data.name || '' }));
                }
                dispatch(setConnectionStatus(true));
                router.push('/jira-projects');
                
            } else if (status === 'oauth_site_selection') {
                // 🟡 CASE 2: Multiple sites found, user needs to select one.
                console.log("Jira Site Selection Required:", event.data);

                if (Array.isArray(sites) && sites.length > 1 && temp_key && user_id) {
                    // Store the data in local state to display the selection modal
                    setSelectionData({ sites, temp_key, user_id });
                    
                    // Crucial: Close the popup window immediately, as the selection happens here (in the main window)
                    if (popup && !popup.closed) {
                        popup.close();
                    }
                } else {
                    console.error("Invalid data for site selection received.");
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, router]);

    // Handle form submission for site selection
    const handleSelectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCloudId && selectionData) {
            // Call the function to finalize the integration
            finalizeIntegration(selectedCloudId, selectionData.temp_key);
        } else {
            alert('Please select a Jira site.');
        }
    }


    const onSubmit = async (data: LoginFormData) => {
        try {
            await dispatch(login({ email: data.email, password: data.password })).unwrap();
            router.push('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const handleJiraConnect = async () => {
        try {
            let userId = ''; 
            // Prefer the user_id from the Redux state if the user is already logged in
            if(user?.user_id){
                userId = user.user_id
            }
            // Add a check to prevent opening multiple popups if selection is active
            if (selectionData) {
                alert("Please complete your Jira site selection first.");
                return;
            }

            const response = await fetch(`${API_URL}/jira/connect?user_id=${userId}`);
            const data = await response.json();

            // Handle already connected
            if (response.status === 409 && data.status === "connected") {
                const token = data.token;
                // If the user was logged in, the user_id is already in state.
                // If the user was not logged in, the backend should return the user_id
                // that corresponds to the connection in data.
                if (token) { dispatch(setToken(token)); }
                if(data.user_id && !user?.user_id){
                     dispatch(setUser({ user_id: data.user_id }));
                }

                dispatch(setConnectionStatus(true));
                router.push('/dashboard');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to get Jira connect URL');
            }

            const oauthUrl = data.oauth_url;
            
            // Open Jira OAuth popup
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            
            window.open(
                oauthUrl,
                'Jira Connect',
                `width=${width},height=${height},left=${left},top=${top}`
            );

        } catch (err) {
            console.error('Failed to get Jira connect URL:', err);
        }
    };

    // --- Modal/Selection UI ---
    const SelectionModal = () => {
        if (!selectionData) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Select Jira Site</h3>
                        <button 
                            onClick={() => setSelectionData(null)} 
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        We found multiple accessible Jira sites. Please select the one you wish to integrate with:
                    </p>
                    
                    <form onSubmit={handleSelectionSubmit} className="space-y-4">
                        <select
                            value={selectedCloudId}
                            onChange={(e) => setSelectedCloudId(e.target.value)}
                            required
                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled>-- Select a Site --</option>
                            {selectionData.sites.map((site) => (
                                <option key={site.cloud_id} value={site.cloud_id}>
                                    {site.site_name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={!selectedCloudId}
                        >
                            Connect to Selected Site
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    // --- End Modal/Selection UI ---


    return (
        <div className="min-h-screen flex items-center justify-center relative">
            {selectionData && <SelectionModal />} {/* Render the modal if selection is needed */}

            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{
                    backgroundImage: 'url("/background.jpg")',
                }}
            />
            
            {/* Content */}
            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in if you already have an account.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                onClick={() => console.log('Google Sign In')}
                                disabled={!!selectionData} // Disable while selection is active
                            >
                                <Image
                                    src="/google-icon.svg"
                                    alt="Google"
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                />
                                Sign In With Google
                            </button>
                            <button
                                className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                onClick={handleJiraConnect}
                                disabled={!!selectionData} // Disable while selection is active
                            >
                                <Image
                                    src="/jira-icon.svg"
                                    alt="Jira"
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                />
                                Sign In With Jira
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or sign in with</span>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            {/* ... (email/password fields remain the same) ... */}
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Work Email
                                    </label>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@tempmail.com"
                                        required
                                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('password')}
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            required
                                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* ... (checkbox and links remain the same) ... */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        {...register('rememberMe')}
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        href="/forgot-password"
                                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !!selectionData} // Disable while selection is active
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}