"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Briefcase, MapPin, DollarSign, Building2, Trash2, Edit3, Check, X, Zap, Globe, ChevronDown, Search, Clock, FileText } from "lucide-react";
import { COUNTRIES, getCountryByCode, searchCountries, type Country } from "@/lib/location-data";
import { useGooglePlacesAutocomplete } from "@/hooks/use-google-places";
import {
    getJobCriteriaAction,
    saveJobCriteriaAction,
    toggleJobCriteriaAction,
    deleteJobCriteriaAction
} from "@/features/matching/actions";
import { toast } from "sonner";

// Types for job criteria (Matches DB schema + UI requirements)
interface JobCriteria {
    id: string;
    name: string;
    jobTitles: string[];
    countryCode: string;
    cities: string[];
    workModes: string[];
    employmentTypes: string[];
    salaryMin?: number;
    salaryMax?: number;
    isActive: boolean;
    matchCount?: number;
}

// Work mode options
const WORK_MODE_OPTIONS = [
    { value: 'remote', label: 'Remote', icon: Zap },
    { value: 'hybrid', label: 'Hybrid', icon: Building2 },
    { value: 'onsite', label: 'On-site', icon: MapPin },
] as const;

// Employment type options
const EMPLOYMENT_TYPE_OPTIONS = [
    { value: 'fulltime', label: 'Full-time', icon: Briefcase },
    { value: 'contract', label: 'Contract', icon: FileText },
    { value: 'parttime', label: 'Part-time', icon: Clock },
] as const;

export default function JobCriteriaPage() {
    const [criteria, setCriteria] = useState<JobCriteria[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCriteria, setEditingCriteria] = useState<JobCriteria | null>(null);

    const loadCriteria = async () => {
        try {
            const data = await getJobCriteriaAction();
            // Map DB isActive (0/1) to boolean
            const formatted = data.map(c => ({
                ...c,
                isActive: c.isActive === 1
            })) as JobCriteria[];
            setCriteria(formatted);
        } catch (error) {
            toast.error("Failed to load criteria");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCriteria();
    }, []);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setCriteria(prev => prev.map(c =>
                c.id === id ? { ...c, isActive: !currentStatus } : c
            ));

            await toggleJobCriteriaAction(id, !currentStatus);
            toast.success(`Search ${!currentStatus ? 'enabled' : 'paused'}`);
        } catch (error) {
            toast.error("Failed to update status");
            loadCriteria(); // Revert
        }
    };

    const deleteCriteria = async (id: string) => {
        try {
            await deleteJobCriteriaAction(id);
            setCriteria(prev => prev.filter(c => c.id !== id));
            toast.success("Criterion removed");
        } catch (error) {
            toast.error("Failed to delete criterion");
        }
    };

    const openAddModal = () => {
        setEditingCriteria(null);
        setModalOpen(true);
    };

    const openEditModal = (item: JobCriteria) => {
        setEditingCriteria(item);
        setModalOpen(true);
    };

    const handleSave = async (data: Omit<JobCriteria, 'id' | 'isActive' | 'matchCount'>) => {
        try {
            const payload = {
                ...data,
                id: editingCriteria?.id
            };
            await saveJobCriteriaAction(payload);
            await loadCriteria();
            setModalOpen(false);
            setEditingCriteria(null);
            toast.success("Criteria saved successfully");
        } catch (error) {
            toast.error("Failed to save criteria");
        }
    };

    const totalMatches = criteria.filter(c => c.isActive).reduce((acc, c) => acc + (c.matchCount || 0), 0);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-foreground/90">Job Criteria</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tell us what jobs you're looking for
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-active-blue">{totalMatches}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Matches</div>
                    </div>
                </div>
            </div>

            {/* Criteria Cards Grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {criteria.map((item) => (
                        <CriteriaCard
                            key={item.id}
                            criteria={item}
                            onEdit={() => openEditModal(item)}
                            onToggleActive={() => toggleActive(item.id, item.isActive)}
                            onDelete={() => deleteCriteria(item.id)}
                        />
                    ))}


                    {/* Add New Card Button */}
                    <button
                        onClick={openAddModal}
                        className="h-[340px] rounded-xl border-2 border-dashed border-white/10 hover:border-active-blue/30 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-active-blue transition-all duration-200 group"
                    >
                        <div className="h-12 w-12 rounded-full bg-white/5 group-hover:bg-active-blue/10 flex items-center justify-center transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">Create New Search</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            <CriteriaModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingCriteria(null);
                }}
                onSave={handleSave}
                initialData={editingCriteria}
            />
        </div>
    );
}

// ============================================
// CRITERIA CARD COMPONENT
// ============================================
function CriteriaCard({
    criteria,
    onEdit,
    onToggleActive,
    onDelete
}: {
    criteria: JobCriteria;
    onEdit: () => void;
    onToggleActive: () => void;
    onDelete: () => void;
}) {
    const country = getCountryByCode(criteria.countryCode);
    const workModeLabels = (criteria.workModes || []).map(m =>
        WORK_MODE_OPTIONS.find(o => o.value === m)?.label || m
    ).join(', ');
    const empTypeLabels = (criteria.employmentTypes || []).map(t =>
        EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === t)?.label || t
    ).join(', ');

    return (
        <div className={`h-[340px] rounded-xl border ${criteria.isActive ? 'border-active-blue/30 bg-active-blue/5' : 'border-white/10 bg-white/[0.02]'} p-5 flex flex-col transition-all duration-200`}>
            {/* Header - Fixed height: 40px */}
            <div className="h-10 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${criteria.isActive ? 'bg-active-blue/20' : 'bg-white/10'} flex items-center justify-center shrink-0`}>
                        <Briefcase className={`h-5 w-5 ${criteria.isActive ? 'text-active-blue' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{criteria.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-medium ${criteria.isActive ? 'text-emerald-green' : 'text-muted-foreground'}`}>
                                {criteria.isActive ? 'Active' : 'Paused'}
                            </span>
                            {criteria.matchCount !== undefined && criteria.isActive && (
                                <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="text-xs text-active-blue font-medium">{criteria.matchCount} matches</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={onToggleActive}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${criteria.isActive ? 'bg-active-blue' : 'bg-white/20'}`}
                >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${criteria.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Content - Fixed sections with standardized heights */}
            <div className="flex-1 flex flex-col mt-4">
                {/* Looking For - Fixed height: 48px */}
                <div className="h-12 shrink-0">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Looking for</div>
                    <div className="flex flex-wrap gap-1.5 overflow-hidden">
                        {criteria.jobTitles.slice(0, 2).map((title, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-foreground/80 truncate max-w-[130px]">
                                {title}
                            </span>
                        ))}
                        {criteria.jobTitles.length > 2 && (
                            <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-muted-foreground">
                                +{criteria.jobTitles.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                {/* Location - Fixed height: 40px */}
                <div className="h-10 shrink-0 mt-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Where</div>
                    <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                        <span>{country?.flag}</span>
                        <span className="truncate">
                            {criteria.cities && criteria.cities.length > 0
                                ? `${criteria.cities[0]}${criteria.cities.length > 1 ? ` +${criteria.cities.length - 1}` : ''}`
                                : country?.name || 'Anywhere'
                            }
                        </span>
                    </div>
                </div>

                {/* Work Style & Employment Type - Fixed height: 40px */}
                <div className="h-10 shrink-0 mt-2 grid grid-cols-2 gap-2">
                    <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Work style</div>
                        <div className="text-sm text-foreground/70 truncate">{workModeLabels || 'Any'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Type</div>
                        <div className="text-sm text-foreground/70 truncate">{empTypeLabels || 'Any'}</div>
                    </div>
                </div>

                {/* Expected Pay - Fixed height: 40px */}
                <div className="h-10 shrink-0 mt-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expected pay</div>
                    <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {criteria.salaryMin || criteria.salaryMax
                                ? `$${(criteria.salaryMin || 0).toLocaleString()} - $${(criteria.salaryMax || 0).toLocaleString()}`
                                : 'Any'
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions - Centered between divider and card bottom */}
            <div className="flex items-center gap-2 py-4 border-t border-white/10 shrink-0">
                <button
                    onClick={onEdit}
                    className="w-1/2 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors font-medium"
                >
                    <Edit3 className="h-4 w-4" />
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="w-1/2 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </button>
            </div>
        </div>
    );
}

// ============================================
// MODAL COMPONENT (LIQUID GLASS UI)
// ============================================
function CriteriaModal({
    isOpen,
    onClose,
    onSave,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<JobCriteria, 'id' | 'isActive' | 'matchCount'>) => void;
    initialData: JobCriteria | null;
}) {
    const [name, setName] = useState('');
    const [jobTitlesInput, setJobTitlesInput] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [workModes, setWorkModes] = useState<JobCriteria['workModes']>([]);
    const [employmentTypes, setEmploymentTypes] = useState<JobCriteria['employmentTypes']>([]);
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setJobTitlesInput(initialData.jobTitles.join(', '));
                setCountryCode(initialData.countryCode);
                setCities(initialData.cities);
                setWorkModes(initialData.workModes);
                setEmploymentTypes(initialData.employmentTypes);
                setSalaryMin(initialData.salaryMin?.toString() || '');
                setSalaryMax(initialData.salaryMax?.toString() || '');
            } else {
                setName('');
                setJobTitlesInput('');
                setCountryCode('');
                setCities([]);
                setWorkModes([]);
                setEmploymentTypes([]);
                setSalaryMin('');
                setSalaryMax('');
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !jobTitlesInput.trim()) return;

        onSave({
            name: name.trim(),
            jobTitles: jobTitlesInput.split(',').map(t => t.trim()).filter(Boolean),
            countryCode,
            cities,
            workModes,
            employmentTypes,
            salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
            salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        });
    };

    const toggleWorkMode = (mode: JobCriteria['workModes'][number]) => {
        setWorkModes(prev =>
            prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
        );
    };

    const toggleEmploymentType = (type: JobCriteria['employmentTypes'][number]) => {
        setEmploymentTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    if (!isOpen) return null;

    const isEditing = !!initialData;
    const selectedCountry = getCountryByCode(countryCode);

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal - LIQUID GLASS UI */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-xl pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Outer glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-active-blue/30 via-emerald-green/20 to-active-blue/30 rounded-3xl blur-2xl opacity-60" />

                    {/* Glass container - solid dark background */}
                    <div className="relative rounded-2xl border border-white/20 bg-[#0d1117] shadow-2xl shadow-black/60 overflow-hidden">
                        {/* Subtle inner highlight */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />

                        {/* Content */}
                        <div className="relative p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-active-blue to-emerald-green flex items-center justify-center shadow-lg shadow-active-blue/30">
                                        <Briefcase className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">
                                            {isEditing ? 'Edit Search' : 'Create New Search'}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Define your ideal job criteria
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Search Name */}
                                <div>
                                    <label className="text-sm font-medium text-foreground/80 mb-2 block">
                                        Name this search <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Senior Data Roles"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/30 focus:bg-white/10 transition-all"
                                        autoFocus
                                    />
                                </div>

                                {/* Job Titles */}
                                <div>
                                    <label className="text-sm font-medium text-foreground/80 mb-2 block">
                                        What roles are you looking for? <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={jobTitlesInput}
                                        onChange={(e) => setJobTitlesInput(e.target.value)}
                                        placeholder="Data Scientist, Senior Data Scientist, ML Engineer"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/30 focus:bg-white/10 transition-all resize-none"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">Separate with commas</p>
                                </div>

                                {/* Location - Country + Cities */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground/80 block">
                                        Where do you want to work?
                                    </label>

                                    <CountryDropdown
                                        value={countryCode}
                                        onChange={(code) => {
                                            setCountryCode(code);
                                            setCities([]); // Reset cities when country changes
                                        }}
                                    />

                                    {countryCode && (
                                        <CityAutocomplete
                                            countryCode={countryCode}
                                            selectedCities={cities}
                                            onCitiesChange={setCities}
                                        />
                                    )}
                                </div>

                                {/* Work Style & Employment Type - Side by Side */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Work Style (Multi-select) */}
                                    <div>
                                        <label className="text-sm font-medium text-foreground/80 mb-2 block">Work style</label>
                                        <div className="flex flex-wrap gap-2">
                                            {WORK_MODE_OPTIONS.map((mode) => (
                                                <button
                                                    key={mode.value}
                                                    type="button"
                                                    onClick={() => toggleWorkMode(mode.value)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${workModes.includes(mode.value)
                                                        ? 'border-active-blue bg-active-blue/20 text-active-blue'
                                                        : 'border-white/10 text-muted-foreground hover:border-white/20 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <mode.icon className="h-3.5 w-3.5" />
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Employment Type (Multi-select) */}
                                    <div>
                                        <label className="text-sm font-medium text-foreground/80 mb-2 block">Employment type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => toggleEmploymentType(type.value)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${employmentTypes.includes(type.value)
                                                        ? 'border-emerald-green bg-emerald-green/20 text-emerald-green'
                                                        : 'border-white/10 text-muted-foreground hover:border-white/20 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <type.icon className="h-3.5 w-3.5" />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Salary Range */}
                                <div>
                                    <label className="text-sm font-medium text-foreground/80 mb-2 block">
                                        Expected salary <span className="text-muted-foreground font-normal">(optional)</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="number"
                                                value={salaryMin}
                                                onChange={(e) => setSalaryMin(e.target.value)}
                                                placeholder="Min"
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 transition-all"
                                            />
                                        </div>
                                        <span className="text-muted-foreground">—</span>
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="number"
                                                value={salaryMax}
                                                onChange={(e) => setSalaryMax(e.target.value)}
                                                placeholder="Max"
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!name.trim() || !jobTitlesInput.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-active-blue to-emerald-green text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-active-blue/25 flex items-center gap-2"
                                    >
                                        <Check className="h-4 w-4" />
                                        {isEditing ? 'Save Changes' : 'Create Search'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ============================================
// COUNTRY DROPDOWN (Searchable)
// ============================================
function CountryDropdown({ value, onChange }: { value: string; onChange: (code: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = getCountryByCode(value);
    const filteredCountries = search ? searchCountries(search) : COUNTRIES;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => { setOpen(!open); setSearch(''); }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left flex items-center justify-between hover:bg-white/10 transition-colors"
            >
                {selectedCountry ? (
                    <span className="flex items-center gap-2">
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                    </span>
                ) : (
                    <span className="text-muted-foreground">Select a country</span>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-30 mt-2 w-full rounded-xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search countries..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 text-sm focus:outline-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                        onChange(country.code);
                                        setOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${value === country.code ? 'bg-active-blue/10 text-active-blue' : ''
                                        }`}
                                >
                                    <span>{country.flag}</span>
                                    <span className="text-sm">{country.name}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-sm text-muted-foreground text-center">No countries found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// CITY AUTOCOMPLETE (Multi-select with chips)
// ============================================
function CityAutocomplete({
    countryCode,
    selectedCities,
    onCitiesChange
}: {
    countryCode: string;
    selectedCities: string[];
    onCitiesChange: (cities: string[]) => void;
}) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use Google Places Autocomplete
    const { predictions, isLoading, searchPlaces, clearPredictions } = useGooglePlacesAutocomplete({
        countryCode,
        debounceMs: 300
    });

    // Search places when input changes
    useEffect(() => {
        if (inputValue.trim().length >= 2) {
            searchPlaces(inputValue);
        } else {
            clearPredictions();
        }
    }, [inputValue, searchPlaces, clearPredictions]);

    const addCity = (cityName: string) => {
        if (!selectedCities.includes(cityName)) {
            onCitiesChange([...selectedCities, cityName]);
        }
        setInputValue('');
        setShowSuggestions(false);
        clearPredictions();
        inputRef.current?.focus();
    };

    const removeCity = (city: string) => {
        onCitiesChange(selectedCities.filter(c => c !== city));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            // If there are predictions, add the first one, otherwise add custom input
            if (predictions.length > 0) {
                addCity(predictions[0].mainText);
            } else {
                addCity(inputValue.trim());
            }
        } else if (e.key === 'Backspace' && !inputValue && selectedCities.length > 0) {
            removeCity(selectedCities[selectedCities.length - 1]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            clearPredictions();
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showDropdown = showSuggestions && (predictions.length > 0 || isLoading);

    return (
        <div className="relative" ref={containerRef}>
            {/* Selected Cities Chips + Input */}
            <div
                className="min-h-[48px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex flex-wrap gap-2 items-center cursor-text focus-within:ring-2 focus-within:ring-active-blue/50 focus-within:border-active-blue/30 focus-within:bg-white/10 transition-all"
                onClick={() => inputRef.current?.focus()}
            >
                {selectedCities.map((city) => (
                    <span
                        key={city}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-active-blue/20 text-active-blue text-xs font-medium"
                    >
                        {city}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeCity(city); }}
                            className="hover:text-white transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedCities.length === 0 ? "Type to search cities..." : ""}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (
                <div className="absolute z-20 mt-2 w-full rounded-xl bg-[#0d1117] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-active-blue/30 border-t-active-blue rounded-full animate-spin" />
                                Searching cities...
                            </div>
                        ) : predictions.length > 0 ? (
                            predictions.map((prediction) => (
                                <button
                                    key={prediction.placeId}
                                    type="button"
                                    onClick={() => addCity(prediction.mainText)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-white/10 transition-colors"
                                >
                                    <div className="text-sm text-foreground">{prediction.mainText}</div>
                                    {prediction.secondaryText && (
                                        <div className="text-xs text-muted-foreground mt-0.5">{prediction.secondaryText}</div>
                                    )}
                                </button>
                            ))
                        ) : inputValue.trim().length >= 2 ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                                No cities found. Press Enter to add "{inputValue.trim()}" manually.
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-1.5">
                Type to search any city worldwide. Leave empty for entire country.
            </p>
        </div>
    );
}
