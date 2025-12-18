import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Plus, MoreVertical, ArrowUpDown, Check, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AddEmployeeDialog from '@/components/features/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/features/employees/EditEmployeeDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { employeesAPI, Employee } from '@/lib/api/employees';
import PageLoading from '@/components/common/PageLoading';
import TableSkeleton from '@/components/common/TableSkeleton';
import LazyImage from '@/components/common/LazyImage';

// Employee type definition (keeping for backward compatibility)
interface Employee {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  date: string;
  jobTitle: string;
  employmentType: 'Employment' | 'Contractor';
  status: 'active' | 'onboarding' | 'off-boarding' | 'dismissed';
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'nguyen.van.an@example.com',
    date: '1 Feb, 2024',
    jobTitle: 'Quản lý cửa hàng',
    employmentType: 'Employment',
    status: 'active',
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'tran.thi.binh@example.com',
    date: '1 Feb, 2024',
    jobTitle: 'Nhân viên bán hàng',
    employmentType: 'Employment',
    status: 'active',
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    email: 'le.van.cuong@example.com',
    date: '8 Sep, 2024',
    jobTitle: 'Thiết kế đồ họa',
    employmentType: 'Contractor',
    status: 'active',
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    email: 'pham.thi.dung@example.com',
    date: '22 Oct, 2024',
    jobTitle: 'Quản lý khách hàng',
    employmentType: 'Employment',
    status: 'active',
  },
  {
    id: 5,
    name: 'Hoàng Văn Em',
    email: 'hoang.van.em@example.com',
    date: '17 Oct, 2024',
    jobTitle: 'Giám đốc tài khoản',
    employmentType: 'Contractor',
    status: 'active',
  },
  {
    id: 6,
    name: 'Võ Thị Phương',
    email: 'vo.thi.phuong@example.com',
    date: '8 Sep, 2024',
    jobTitle: 'Nhà thiết kế Motion',
    employmentType: 'Employment',
    status: 'onboarding',
  },
  {
    id: 7,
    name: 'Đỗ Văn Giang',
    email: 'do.van.giang@example.com',
    date: '21 Sep, 2024',
    jobTitle: 'Giám đốc Marketing',
    employmentType: 'Employment',
    status: 'active',
  },
  {
    id: 8,
    name: 'Bùi Thị Hoa',
    email: 'bui.thi.hoa@example.com',
    date: '8 Sep, 2024',
    jobTitle: 'Quản lý hỗ trợ khách hàng',
    employmentType: 'Contractor',
    status: 'off-boarding',
  },
  {
    id: 9,
    name: 'Ngô Văn Ích',
    email: 'ngo.van.ich@example.com',
    date: '16 May, 2024',
    jobTitle: 'Nhà thiết kế UI/UX',
    employmentType: 'Employment',
    status: 'active',
  },
  {
    id: 10,
    name: 'Lý Thị Kim',
    email: 'ly.thi.kim@example.com',
    date: '24 May, 2024',
    jobTitle: 'Lập trình viên Backend',
    employmentType: 'Employment',
    status: 'active',
  },
];

type TabStatus = 'ACTIVE' | 'all';
type SortField = 'name' | 'date' | 'jobTitle';
type SortOrder = 'asc' | 'desc';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    // Load employees from API
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const response = await employeesAPI.getAll();
        console.log('[EmployeesPage] Raw API response from employeesAPI:', response);
        console.log('[EmployeesPage] Response type:', typeof response);
        console.log('[EmployeesPage] Is array?', Array.isArray(response));
        console.log('[EmployeesPage] Has content?', response && typeof response === 'object' && 'content' in response);
        
        // employeesAPI.getAll() đã trả về PaginatedResponse, lấy content
        let data: Employee[] = [];
        if (response && typeof response === 'object' && 'content' in response) {
          // PaginatedResponse format
          data = Array.isArray(response.content) ? response.content : [];
          console.log('[EmployeesPage] Extracted from PaginatedResponse.content:', data.length);
        } else if (Array.isArray(response)) {
          // Direct array (fallback)
          data = response;
          console.log('[EmployeesPage] Response is direct array:', data.length);
        } else {
          console.error('[EmployeesPage] Unknown response format:', response);
          data = [];
        }
        
        // Ensure data is always an array
        if (!Array.isArray(data)) {
          console.error('[EmployeesPage] Data is not an array after processing:', data);
          data = [];
        }
        
        console.log('[EmployeesPage] Final employees array:', data);
        
        console.log('[EmployeesPage] Processed employees:', data);
        if (data.length > 0) {
          console.log('[EmployeesPage] First employee:', data[0]);
          console.log('[EmployeesPage] First employee ngayBatDau:', data[0].ngayBatDau);
        }
        setEmployees(data);
      } catch (error: any) {
        console.error('Error loading employees:', error);
        setEmployees(mockEmployees);
        toast.error('Không thể tải danh sách nhân viên. Đang dùng dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  // Memoize filtered employees to avoid recalculating on every render
  const filteredEmployees = useMemo(() => {
    // Đảm bảo employees luôn là array
    if (!Array.isArray(employees)) {
      console.error('[EmployeesPage] employees is not an array:', employees);
      return [];
    }

    // Filter employees by trangThai (ACTIVE/INACTIVE)
    let filtered = [...employees];
    
    // Tab "Tất cả" hiển thị tất cả nhân viên (ACTIVE và INACTIVE)
    // Tab "Đang hoạt động" chỉ hiển thị ACTIVE
    if (activeTab === 'ACTIVE') {
      filtered = filtered.filter(emp => {
        const trangThai = emp.trangThai || 'ACTIVE';
        return trangThai === 'ACTIVE';
      });
    }
    // Nếu activeTab === 'all', không filter (hiển thị tất cả)

    // Filter by search keyword
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        emp => {
          const name = emp.tenNhanVien || emp.name || '';
          const email = emp.email || '';
          const jobTitle = emp.jobTitle || emp.role || '';
          const maNhanVien = emp.maNhanVien || '';
          return name.toLowerCase().includes(keyword) ||
                 email.toLowerCase().includes(keyword) ||
                 jobTitle.toLowerCase().includes(keyword) ||
                 maNhanVien.toLowerCase().includes(keyword);
        }
      );
    }

    // Sort employees
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = (a.tenNhanVien || a.name || '').toLowerCase();
          bValue = (b.tenNhanVien || b.name || '').toLowerCase();
          break;
        case 'date':
          // Sort by ngayBatDau (ngày bắt đầu) or date
          const aDate = a.ngayBatDau || a.date || '';
          const bDate = b.ngayBatDau || b.date || '';
          aValue = aDate ? new Date(aDate).getTime() : 0;
          bValue = bDate ? new Date(bDate).getTime() : 0;
          break;
        case 'jobTitle':
          aValue = (a.jobTitle || a.role || '').toLowerCase();
          bValue = (b.jobTitle || b.role || '').toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [employees, activeTab, searchKeyword, sortField, sortOrder]);


  // Memoize handlers to prevent unnecessary re-renders
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  }, [sortField, sortOrder]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleAddEmployee = useCallback(async () => {
    // Reload employees from API
    try {
      const response = await employeesAPI.getAll();
      console.log('[EmployeesPage] handleAddEmployee - Raw response:', response);
      
      // employeesAPI.getAll() đã trả về PaginatedResponse, lấy content
      let data: Employee[] = [];
      if (response && typeof response === 'object' && 'content' in response) {
        data = Array.isArray(response.content) ? response.content : [];
        console.log('[EmployeesPage] handleAddEmployee - Extracted from content:', data.length);
      } else if (Array.isArray(response)) {
        data = response;
        console.log('[EmployeesPage] handleAddEmployee - Direct array:', data.length);
      } else {
        console.error('[EmployeesPage] handleAddEmployee - Unknown format:', response);
        data = [];
      }
      
      if (!Array.isArray(data)) {
        console.error('[EmployeesPage] handleAddEmployee - Data is not array:', data);
        data = [];
      }
      
      setEmployees(data);
    } catch (error: any) {
      console.error('Error reloading employees:', error);
    }
  }, []);

  const handleUpdateEmployee = useCallback(async (updatedEmployeeId?: number, newTrangThai?: 'ACTIVE' | 'INACTIVE') => {
    // Reload employees from API
    setLoading(true);
    try {
      const response = await employeesAPI.getAll();
      console.log('[EmployeesPage] handleUpdateEmployee - Raw response:', response);
      
      // employeesAPI.getAll() đã trả về PaginatedResponse, lấy content
      let data: Employee[] = [];
      if (response && typeof response === 'object' && 'content' in response) {
        data = Array.isArray(response.content) ? response.content : [];
        console.log('[EmployeesPage] handleUpdateEmployee - Extracted from content:', data.length);
      } else if (Array.isArray(response)) {
        data = response;
        console.log('[EmployeesPage] handleUpdateEmployee - Direct array:', data.length);
      } else {
        console.error('[EmployeesPage] handleUpdateEmployee - Unknown format:', response);
        data = [];
      }
      
      if (!Array.isArray(data)) {
        console.error('[EmployeesPage] handleUpdateEmployee - Data is not array:', data);
        data = [];
      }
      
      console.log('[EmployeesPage] Reloaded employees after update:', data);
      if (data.length > 0) {
        console.log('[EmployeesPage] First employee after reload:', data[0]);
        console.log('[EmployeesPage] First employee ngayBatDau after reload:', data[0].ngayBatDau);
      }
      setEmployees(data);
      
      // Nếu nhân viên vừa được đổi thành INACTIVE và đang ở tab ACTIVE, chuyển sang tab "Tất cả"
      if (updatedEmployeeId && newTrangThai === 'INACTIVE' && activeTab === 'ACTIVE') {
        setActiveTab('all');
        toast.info('Đã chuyển sang tab "Tất cả" để xem nhân viên ngừng hoạt động');
      }
    } catch (error: any) {
      console.error('Error reloading employees:', error);
      toast.error('Không thể tải lại danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleDeleteEmployee = useCallback(async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await employeesAPI.delete(id);
        setEmployees(employees.filter(emp => emp.id !== id));
        toast.success('Đã xóa nhân viên thành công');
      } catch (error: any) {
        console.error('Error deleting employee:', error);
        toast.error(error.response?.data?.message || 'Không thể xóa nhân viên');
      }
    }
  }, [employees]);

  const handleEditClick = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  }, []);

  const handleDeleteClick = useCallback((employee: Employee) => {
    handleDeleteEmployee(employee.id);
  }, [handleDeleteEmployee]);

  const tabs = [
    { id: 'all' as TabStatus, label: 'Tất cả', count: Array.isArray(employees) ? employees.length : 0 },
    { id: 'ACTIVE' as TabStatus, label: 'Đang hoạt động', count: Array.isArray(employees) ? employees.filter(e => (e.trangThai || 'ACTIVE') === 'ACTIVE').length : 0 },
  ];

  const sortOptions = [
    { field: 'name' as SortField, label: 'Tên' },
    { field: 'date' as SortField, label: 'Ngày bắt đầu' },
    { field: 'jobTitle' as SortField, label: 'Chức vụ' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nhân viên</h1>
            <p className="text-gray-600 mt-1">Quản lý và cộng tác với nhân viên trong tổ chức của bạn</p>
          </div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors relative flex items-center',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs font-medium',
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter, Sort Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <Button
              variant="outline"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <span>Sắp xếp</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.field}
                      onClick={() => handleSort(option.field)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between',
                        sortField === option.field && 'bg-orange-50 text-orange-600'
                      )}
                    >
                      <span>{option.label}</span>
                      {sortField === option.field && (
                        <Check className="w-4 h-4 text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Employee Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Tên
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Ngày bắt đầu
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('jobTitle')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Chức vụ
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(employee => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            {employee.avatar ? (
                              <LazyImage
                                src={employee.avatar}
                                alt={employee.tenNhanVien || employee.name || ''}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-orange-600 font-semibold text-sm">
                                {getInitials(employee.tenNhanVien || employee.name || '')}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.tenNhanVien || employee.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{employee.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {employee.maNhanVien || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(() => {
                          // Debug log
                          if (employee.id && employee.ngayBatDau) {
                            console.log(`[EmployeesPage] Employee ${employee.id} ngayBatDau:`, employee.ngayBatDau);
                          }
                          // Format ngayBatDau
                          if (employee.ngayBatDau) {
                            try {
                              const date = new Date(employee.ngayBatDau);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              }
                            } catch (e) {
                              console.error('Error formatting ngayBatDau:', e, employee.ngayBatDau);
                            }
                          }
                          return employee.date || '-';
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {employee.jobTitle || (employee.role === 'ADMIN' ? 'Quản trị viên' : employee.role === 'MANAGER' ? 'Quản lý' : employee.role === 'CASHIER' ? 'Thu ngân' : employee.role || '-')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                            (employee.trangThai === 'ACTIVE' || !employee.trangThai)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {employee.trangThai === 'INACTIVE' ? 'Nghỉ việc' : 'Đang hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label={`Tùy chọn cho ${employee.tenNhanVien || employee.name || 'nhân viên'}`}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(employee)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(employee)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddEmployee}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        employee={selectedEmployee}
        onUpdate={handleUpdateEmployee}
      />
    </div>
  );
}

