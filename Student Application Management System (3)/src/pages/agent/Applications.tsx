import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Filter, Eye, LayoutList, CalendarDays, LayoutDashboard, Settings2, X, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Trash2, CheckCircle2, ChevronsUpDown, MoreVertical, Edit } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import { ApplicationStatusBadge } from '../../components/shared/ApplicationStatusBadge';
import { mockApplications } from '../../lib/mockData';
import { ApplicationStatus, Application } from '../../lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { ApplicationCalendar } from '../../components/calendar/ApplicationCalendar';

type ViewMode = 'table' | 'timeline' | 'kanban';

// Column configuration
type ColumnKey = 'reference' | 'studentName' | 'course' | 'destination' | 'status' | 'assignedTo' | 'submitted' | 'intake';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  filterable: boolean;
  sortable?: boolean;
}

// Column filters type
type ColumnFilters = {
  [K in ColumnKey]?: string;
};

// Sorting type
type SortConfig = {
  key: ColumnKey | null;
  direction: 'asc' | 'desc' | null;
};

// Reusable Application Card Component (DRY)
function ApplicationCard({ app, formatDate, variant = 'full' }: { app: Application; formatDate: (date: string) => string; variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/40">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm mb-1">{app.studentName}</p>
              <p className="text-xs text-muted-foreground truncate">{app.course}</p>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{app.destination}</span>
              <Badge variant="outline" className="text-xs h-5">
                {app.referenceNumber}
              </Badge>
            </div>

            {app.assignedStaffName && (
              <p className="text-xs text-muted-foreground">👤 {app.assignedStaffName}</p>
            )}

            <Link to={`/agent/applications/${app.id}`} className="block">
              <Button variant="ghost" size="sm" className="w-full gap-2 h-8">
                <Eye className="h-3 w-3" />
                View
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{app.studentName}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {app.referenceNumber}
              </Badge>
            </div>
            <ApplicationStatusBadge status={app.status} />
          </div>
          
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">{app.course}</p>
            <p className="text-muted-foreground">{app.destination} • {app.intake}</p>
            <p className="text-muted-foreground">Submitted: {formatDate(app.submittedAt)}</p>
            {app.assignedStaffName && (
              <p className="text-muted-foreground">Assigned to: {app.assignedStaffName}</p>
            )}
          </div>

          <Link to={`/agent/applications/${app.id}`}>
            <Button variant="outline" className="w-full gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Timeline View Component
function TimelineView({ applications, formatDate }: { applications: Application[]; formatDate: (date: string) => string }) {
  return <ApplicationCalendar applications={applications} portalType="agent" />;
}

// Kanban View Component
function KanbanView({ applications, formatDate }: { applications: Application[]; formatDate: (date: string) => string }) {
  const statuses = [
    ApplicationStatus.DRAFT,
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.OFFER_SENT,
    ApplicationStatus.OFFER_ACCEPTED,
    ApplicationStatus.GS_INTERVIEW_SCHEDULED,
    ApplicationStatus.GS_APPROVED,
    ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED,
    ApplicationStatus.REJECTED,
  ];

  const statusLabels: Record<string, string> = {
    [ApplicationStatus.DRAFT]: 'Draft',
    [ApplicationStatus.SUBMITTED]: 'Application Submitted',
    [ApplicationStatus.UNDER_REVIEW]: 'Application Under Review',
    [ApplicationStatus.OFFER_SENT]: 'Offer Received',
    [ApplicationStatus.OFFER_ACCEPTED]: 'Offer Signed',
    [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: 'GS In Progress',
    [ApplicationStatus.GS_APPROVED]: 'GS Approved',
    [ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED]: 'Further Document Required',
    [ApplicationStatus.REJECTED]: 'Rejected',
  };

  const statusColors: Record<string, string> = {
    [ApplicationStatus.DRAFT]: 'bg-gray-500',
    [ApplicationStatus.SUBMITTED]: 'bg-blue-500',
    [ApplicationStatus.UNDER_REVIEW]: 'bg-yellow-500',
    [ApplicationStatus.OFFER_SENT]: 'bg-purple-500',
    [ApplicationStatus.OFFER_ACCEPTED]: 'bg-indigo-500',
    [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: 'bg-orange-500',
    [ApplicationStatus.GS_APPROVED]: 'bg-green-500',
    [ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED]: 'bg-amber-500',
    [ApplicationStatus.REJECTED]: 'bg-red-500',
  };

  const statusBackgrounds: Record<string, string> = {
    [ApplicationStatus.DRAFT]: 'bg-gray-500/5',
    [ApplicationStatus.SUBMITTED]: 'bg-blue-500/5',
    [ApplicationStatus.UNDER_REVIEW]: 'bg-yellow-500/5',
    [ApplicationStatus.OFFER_SENT]: 'bg-purple-500/5',
    [ApplicationStatus.OFFER_ACCEPTED]: 'bg-indigo-500/5',
    [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: 'bg-orange-500/5',
    [ApplicationStatus.GS_APPROVED]: 'bg-green-500/5',
    [ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED]: 'bg-amber-500/5',
    [ApplicationStatus.REJECTED]: 'bg-red-500/5',
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        <Card>
          <div>
            <div className="flex gap-4">
              {statuses.map((status) => {
                const statusApps = applications.filter(app => app.status === status);
                return (
                  <div key={status} className={`flex-shrink-0 w-[320px] rounded-lg p-3 ${statusBackgrounds[status]}`}>
                    <div className="bg-white/50 dark:bg-background/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                        <h3 className="font-medium text-sm">{statusLabels[status]}</h3>
                        <Badge variant="secondary" className="ml-auto text-xs h-5">
                          {statusApps.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2.5 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                      {statusApps.map((app) => (
                        <ApplicationCard key={app.id} app={app} formatDate={formatDate} variant="compact" />
                      ))}
                      {statusApps.length === 0 && (
                        <div className="rounded-lg bg-white/30 dark:bg-background/30 p-8 text-center">
                          <p className="text-xs text-muted-foreground">No applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AgentApplications() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable');
  
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: 'reference', label: 'Reference', visible: true, filterable: true, sortable: true },
    { key: 'studentName', label: 'Student Name', visible: true, filterable: true, sortable: true },
    { key: 'course', label: 'Course', visible: true, filterable: true, sortable: true },
    { key: 'destination', label: 'Destination', visible: true, filterable: true, sortable: true },
    { key: 'status', label: 'Status', visible: true, filterable: true, sortable: true },
    { key: 'assignedTo', label: 'Assigned To', visible: true, filterable: true, sortable: true },
    { key: 'submitted', label: 'Submitted', visible: true, filterable: true, sortable: true },
    { key: 'intake', label: 'Intake', visible: true, filterable: true, sortable: true },
  ]);

  // Load submitted applications from localStorage on mount
  useEffect(() => {
    const loadApplications = () => {
      try {
        const submittedAppsStr = localStorage.getItem('submitted_applications');
        if (submittedAppsStr) {
          const submittedApps = JSON.parse(submittedAppsStr);
          // Merge submitted applications with mock data
          // Filter out any mock apps that have the same ID as submitted apps
          const mergedApps = [...submittedApps, ...mockApplications.filter(
            mockApp => !submittedApps.some((subApp: any) => subApp.id === mockApp.id)
          )];
          setApplications(mergedApps);
        }
      } catch (error) {
        console.error('Error loading submitted applications:', error);
      }
    };
    
    loadApplications();
  }, []);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(apps => 
      apps.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleSort = (key: ColumnKey) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key: direction ? key : null, direction });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedApplications.map(app => app.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    setApplications(apps => apps.filter(app => !selectedRows.has(app.id)));
    setSelectedRows(new Set());
  };

  const handleBulkStatusChange = (newStatus: ApplicationStatus) => {
    setApplications(apps =>
      apps.map(app =>
        selectedRows.has(app.id) ? { ...app, status: newStatus } : app
      )
    );
    setSelectedRows(new Set());
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    // Column filters matching
    const matchesColumnFilters = Object.entries(columnFilters).every(([key, value]) => {
      if (!value) return true;
      
      const lowerValue = value.toLowerCase();
      
      switch (key as ColumnKey) {
        case 'reference':
          return app.referenceNumber.toLowerCase().includes(lowerValue);
        case 'studentName':
          return app.studentName.toLowerCase().includes(lowerValue) || 
                 app.studentEmail.toLowerCase().includes(lowerValue);
        case 'course':
          return app.course.toLowerCase().includes(lowerValue);
        case 'destination':
          return app.destination.toLowerCase().includes(lowerValue);
        case 'status':
          return app.status.toLowerCase().includes(lowerValue);
        case 'assignedTo':
          return (app.assignedStaffName?.toLowerCase() || '').includes(lowerValue);
        case 'submitted':
          return formatDate(app.submittedAt).toLowerCase().includes(lowerValue);
        case 'intake':
          return app.intake.toLowerCase().includes(lowerValue);
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesStatus && matchesColumnFilters;
  });

  // Sorted applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case 'reference':
        aValue = a.referenceNumber;
        bValue = b.referenceNumber;
        break;
      case 'studentName':
        aValue = a.studentName;
        bValue = b.studentName;
        break;
      case 'course':
        aValue = a.course;
        bValue = b.course;
        break;
      case 'destination':
        aValue = a.destination;
        bValue = b.destination;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'assignedTo':
        aValue = a.assignedStaffName || '';
        bValue = b.assignedStaffName || '';
        break;
      case 'submitted':
        aValue = new Date(a.submittedAt).getTime();
        bValue = new Date(b.submittedAt).getTime();
        break;
      case 'intake':
        aValue = a.intake;
        bValue = b.intake;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedApplications = sortedApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(sortedApplications.length / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Page header with integrated search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Search, Filters, and Actions Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ApplicationStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={ApplicationStatus.SUBMITTED}>Application Submitted</SelectItem>
                <SelectItem value={ApplicationStatus.UNDER_REVIEW}>Application Under Review</SelectItem>
                <SelectItem value={ApplicationStatus.OFFER_SENT}>Offer Received</SelectItem>
                <SelectItem value={ApplicationStatus.OFFER_ACCEPTED}>Offer Signed</SelectItem>
                <SelectItem value={ApplicationStatus.GS_INTERVIEW_SCHEDULED}>GS In Progress</SelectItem>
                <SelectItem value={ApplicationStatus.GS_APPROVED}>GS Approved</SelectItem>
                <SelectItem value={ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED}>Further Document Required</SelectItem>
                <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full lg:w-auto">
                  <Filter className="h-4 w-4" />
                  <span className="lg:hidden">More Filters</span>
                  {Object.keys(columnFilters).filter(k => columnFilters[k as ColumnKey]).length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {Object.keys(columnFilters).filter(k => columnFilters[k as ColumnKey]).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Column Filters</h4>
                    <div className="space-y-3">
                      {columnConfig.filter(c => c.filterable && c.visible).map(c => (
                        <div key={c.key} className="space-y-1.5">
                          <Label htmlFor={`filter-${c.key}`} className="text-sm">
                            {c.label}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`filter-${c.key}`}
                              placeholder={`Filter ${c.label.toLowerCase()}...`}
                              value={columnFilters[c.key] || ''}
                              onChange={(e) => {
                                setColumnFilters({
                                  ...columnFilters,
                                  [c.key]: e.target.value || undefined,
                                });
                              }}
                              className="pr-8"
                            />
                            {columnFilters[c.key] && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                onClick={() => {
                                  setColumnFilters({
                                    ...columnFilters,
                                    [c.key]: undefined,
                                  });
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {Object.keys(columnFilters).some(k => columnFilters[k as ColumnKey]) && (
                    <>
                      <Separator />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setColumnFilters({})}
                      >
                        Clear All Filters
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Column Visibility */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full lg:w-auto">
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden lg:inline">Columns</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Toggle Columns</h4>
                    <div className="space-y-2">
                      {columnConfig.map(c => (
                        <div key={c.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`col-${c.key}`}
                            checked={c.visible}
                            onCheckedChange={(checked) => {
                              setColumnConfig(columnConfig.map(col =>
                                col.key === c.key ? { ...col, visible: !!checked } : col
                              ));
                            }}
                          />
                          <Label
                            htmlFor={`col-${c.key}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {c.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setColumnConfig(columnConfig.map(c => ({ ...c, visible: true })));
                      }}
                    >
                      Show All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setColumnConfig(columnConfig.map(c => ({ ...c, visible: false })));
                      }}
                    >
                      Hide All
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Export Button */}
            <Button variant="outline" className="gap-2 w-full lg:w-auto">
              <Download className="h-4 w-4" />
              <span className="lg:hidden">Export</span>
            </Button>

            {/* View Toggle */}
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)} variant="outline" className="w-full lg:w-auto justify-start">
              <ToggleGroupItem value="table" aria-label="Table view" className="flex-1 lg:flex-none">
                <LayoutList className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="timeline" aria-label="Timeline view" className="flex-1 lg:flex-none">
                <CalendarDays className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="kanban" aria-label="Kanban view" className="flex-1 lg:flex-none">
                <LayoutDashboard className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            {/* New Application Button */}
            <Link to="/agent/applications/new" className="w-full lg:w-auto">
              <Button className="gap-2 w-full">
                <Plus className="h-4 w-4" />
                New Application
              </Button>
            </Link>
          </div>

          {/* Results Summary */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {applications.length} applications
          </p>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {/* Bulk Actions Bar */}
          {selectedRows.size > 0 && (
            <Card className="hidden md:block">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {selectedRows.size} selected
                    </span>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleBulkStatusChange}>
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ApplicationStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={ApplicationStatus.SUBMITTED}>Application Submitted</SelectItem>
                          <SelectItem value={ApplicationStatus.UNDER_REVIEW}>Application Under Review</SelectItem>
                          <SelectItem value={ApplicationStatus.OFFER_SENT}>Offer Received</SelectItem>
                          <SelectItem value={ApplicationStatus.OFFER_ACCEPTED}>Offer Signed</SelectItem>
                          <SelectItem value={ApplicationStatus.GS_INTERVIEW_SCHEDULED}>GS In Progress</SelectItem>
                          <SelectItem value={ApplicationStatus.GS_APPROVED}>GS Approved</SelectItem>
                          <SelectItem value={ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED}>Further Document Required</SelectItem>
                          <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desktop Table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-background w-12">
                      <Checkbox
                        checked={paginatedApplications.length > 0 && paginatedApplications.every(app => selectedRows.has(app.id))}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {columnConfig.filter(c => c.visible).map(c => (
                      <TableHead key={c.key} className="whitespace-nowrap">
                        {c.sortable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => handleSort(c.key)}
                          >
                            <span>{c.label}</span>
                            {sortConfig.key === c.key ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          c.label
                        )}
                      </TableHead>
                    ))}
                    <TableHead className="sticky right-0 z-20 bg-background text-center whitespace-nowrap w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columnConfig.filter(c => c.visible).length + 2} className="text-center py-8 text-muted-foreground">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedApplications.map((app) => (
                      <TableRow 
                        key={app.id} 
                        data-state={selectedRows.has(app.id) && "selected"}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => {
                          // Don't navigate if clicking on checkbox or action buttons
                          const target = e.target as HTMLElement;
                          if (
                            target.closest('button') || 
                            target.closest('[role="checkbox"]') ||
                            target.closest('input[type="checkbox"]')
                          ) {
                            return;
                          }
                          navigate(`/agent/applications/${app.id}`);
                        }}
                      >
                        <TableCell className="sticky left-0 z-10 bg-background" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRows.has(app.id)}
                            onCheckedChange={(checked) => handleSelectRow(app.id, !!checked)}
                            aria-label={`Select ${app.studentName}`}
                          />
                        </TableCell>
                        {columnConfig.filter(c => c.visible).map(c => (
                          <TableCell key={c.key} className="whitespace-nowrap">
                            {c.key === 'reference' && <Badge variant="outline">{app.referenceNumber}</Badge>}
                            {c.key === 'studentName' && (
                              <div className="min-w-[180px]">
                                <div>{app.studentName}</div>
                                <div className="text-xs text-muted-foreground">{app.studentEmail}</div>
                              </div>
                            )}
                            {c.key === 'course' && (
                              <div className="max-w-[250px] truncate" title={app.course}>{app.course}</div>
                            )}
                            {c.key === 'destination' && app.destination}
                            {c.key === 'status' && <ApplicationStatusBadge status={app.status} />}
                            {c.key === 'assignedTo' && (
                              app.assignedStaffName || (
                                <span className="text-muted-foreground text-sm">Not assigned</span>
                              )
                            )}
                            {c.key === 'submitted' && <span className="text-sm text-muted-foreground">{formatDate(app.submittedAt)}</span>}
                            {c.key === 'intake' && <span className="text-sm">{app.intake}</span>}
                          </TableCell>
                        ))}
                        <TableCell className="sticky right-0 z-10 bg-background text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/agent/applications/${app.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/agent/applications/edit/${app.id}`} className="flex items-center cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setApplications(apps => apps.filter(a => a.id !== app.id));
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Rows per page
                  </p>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Mobile List */}
          <div className="md:hidden space-y-4">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No applications found
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((app) => (
                <ApplicationCard key={app.id} app={app} formatDate={formatDate} />
              ))
            )}
          </div>
        </>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No applications found
            </CardContent>
          </Card>
        ) : (
          <TimelineView applications={filteredApplications} formatDate={formatDate} />
        )
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <KanbanView applications={filteredApplications} formatDate={formatDate} />
      )}
    </div>
  );
}