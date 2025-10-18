import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, Activity, Users, Bed, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHospitalStore } from '@/store/hospitalStore';
import { toast } from 'sonner';
import BedMap3D from '@/components/BedMap3D';
import EmergencyTrigger from '@/components/EmergencyTrigger';
import ActiveEmergencies from '@/components/ActiveEmergencies';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hospital, beds, nurses, doctors, emergencies, setBeds, setNurses, setDoctors, setEmergencies } = useHospitalStore();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedBed, setSelectedBed] = useState<any>(null);

  useEffect(() => {
    // Mock data generation
    const mockBeds = Array.from({ length: 30 }, (_, i) => {
      const floor = Math.floor(i / 10) + 1;
      const x = (i % 5) * 2 - 4;
      const z = Math.floor((i % 10) / 5) * 3 - 1.5;
      const statuses = ['available', 'occupied', 'cleaning', 'icu'] as const;
      return {
        id: `bed-${i + 1}`,
        bed_number: `${floor}0${(i % 10) + 1}${String.fromCharCode(65 + Math.floor((i % 10) / 5))}`,
        floor,
        status: i < 5 ? 'icu' : statuses[Math.floor(Math.random() * 3)],
        position: { x, y: 0, z },
        patient: i % 3 === 0 ? `Patient ${i + 1}` : undefined,
      };
    });

    const mockNurses = Array.from({ length: 15 }, (_, i) => ({
      id: `nurse-${i + 1}`,
      name: ['Sarah Johnson', 'Priya Sharma', 'Amit Kumar', 'Lisa Chen', 'Raj Patel'][i % 5],
      nurse_id: `N${String(i + 1).padStart(3, '0')}`,
      specialization: ['ICU', 'General', 'Emergency', 'Pediatric', 'Surgery'][i % 5],
      status: (i % 3 === 0 ? 'busy' : 'available') as 'available' | 'busy',
      assignment: i % 3 === 0 ? 'EMG-123456789' : undefined,
    }));

    const mockDoctors = Array.from({ length: 8 }, (_, i) => ({
      id: `doctor-${i + 1}`,
      name: ['Dr. Ramesh Kumar', 'Dr. Emily Watson', 'Dr. Ahmed Hassan', 'Dr. Maria Garcia'][i % 4],
      doctor_id: `D${String(i + 1).padStart(3, '0')}`,
      specialization: ['Cardiology', 'Emergency', 'Neurology', 'General Surgery'][i % 4],
      status: (i % 4 === 0 ? 'busy' : 'available') as 'available' | 'busy',
      assignment: i % 4 === 0 ? 'EMG-123456789' : undefined,
    }));

    const mockEmergencies = [
      {
        id: '1',
        emergency_id: 'EMG-1234567890',
        type: 'Cardiac Emergency',
        patient_name: 'John Doe',
        status: 'active',
        bed: mockBeds.find((b) => b.bed_number === '201A'),
        nurse: mockNurses.find((n) => n.name === 'Sarah Johnson'),
        doctor: mockDoctors.find((d) => d.name === 'Dr. Ramesh Kumar'),
        created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: '2',
        emergency_id: 'EMG-1234567891',
        type: 'Trauma',
        patient_name: 'Jane Smith',
        status: 'active',
        bed: mockBeds.find((b) => b.bed_number === '102B'),
        nurse: mockNurses.find((n) => n.name === 'Priya Sharma'),
        doctor: mockDoctors.find((d) => d.name === 'Dr. Emily Watson'),
        created_at: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: '3',
        emergency_id: 'EMG-1234567892',
        type: 'Respiratory Failure',
        patient_name: 'Bob Wilson',
        status: 'active',
        bed: mockBeds.find((b) => b.bed_number === '305A'),
        nurse: mockNurses.find((n) => n.name === 'Amit Kumar'),
        doctor: mockDoctors.find((d) => d.name === 'Dr. Ahmed Hassan'),
        created_at: new Date(Date.now() - 20 * 60000).toISOString(),
      },
    ];

    setBeds(mockBeds);
    setNurses(mockNurses);
    setDoctors(mockDoctors);
    setEmergencies(mockEmergencies);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleTriggerEmergency = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const availableBed = beds.find((b) => b.status === 'available');
    const availableNurse = nurses.find((n) => n.status === 'available');
    const availableDoctor = doctors.find((d) => d.status === 'available');
    
    const newEmergency = {
      id: Date.now().toString(),
      emergency_id: `EMG-${Date.now()}`,
      type: data.type,
      patient_name: data.patient_name,
      status: 'active',
      bed: availableBed,
      nurse: availableNurse,
      doctor: availableDoctor,
      created_at: new Date().toISOString(),
    };

    setEmergencies([newEmergency, ...emergencies]);
  };

  const handleResolveEmergency = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setEmergencies(emergencies.filter((e) => e.id !== id));
    toast.success('Emergency resolved');
  };

  const availableBeds = beds.filter((b) => b.status === 'available').length;
  const availableNurses = nurses.filter((n) => n.status === 'available').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CareFlow Nexus</h1>
              <p className="text-sm text-muted-foreground">{hospital?.name || 'Hospital'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Admin</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Status Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="text-2xl font-bold">{beds.length}</p>
                </div>
                <Bed className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-success">{availableBeds}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-success font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nurses</p>
                  <p className="text-2xl font-bold">{availableNurses}/{nurses.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Emergency</p>
                  <p className="text-2xl font-bold text-emergency">{emergencies.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-emergency" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Status</p>
                  <Badge variant="outline" className="mt-1 bg-success/10 text-success border-success">
                    🟢 Online
                  </Badge>
                </div>
                <Activity className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <EmergencyTrigger onTrigger={handleTriggerEmergency} />
            <ActiveEmergencies emergencies={emergencies} onResolve={handleResolveEmergency} />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>3D Bed Map</CardTitle>
                  <div className="flex gap-2">
                    {Array.from({ length: hospital?.floors || 3 }, (_, i) => i + 1).map((floor) => (
                      <Button
                        key={floor}
                        size="sm"
                        variant={selectedFloor === floor ? 'default' : 'outline'}
                        onClick={() => setSelectedFloor(floor)}
                        className={selectedFloor === floor ? 'bg-gradient-to-r from-primary to-accent' : ''}
                      >
                        Floor {floor}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden bg-secondary/30">
                  <BedMap3D
                    beds={beds}
                    selectedFloor={selectedFloor}
                    onSelectBed={setSelectedBed}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emergency" />
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning" />
                    <span>Cleaning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-icu" />
                    <span>ICU</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Tabs */}
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardContent className="pt-6">
                <Tabs defaultValue="nurses">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="nurses">👩‍⚕️ Nurses</TabsTrigger>
                    <TabsTrigger value="beds">🏥 Beds</TabsTrigger>
                    <TabsTrigger value="doctors">👨‍⚕️ Doctors</TabsTrigger>
                    <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="nurses" className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-2 font-semibold">Name</th>
                            <th className="pb-2 font-semibold">ID</th>
                            <th className="pb-2 font-semibold">Specialization</th>
                            <th className="pb-2 font-semibold">Status</th>
                            <th className="pb-2 font-semibold">Assignment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nurses.map((nurse) => (
                            <tr key={nurse.id} className="border-b border-border">
                              <td className="py-3">{nurse.name}</td>
                              <td className="py-3 font-mono text-xs">{nurse.nurse_id}</td>
                              <td className="py-3">{nurse.specialization}</td>
                              <td className="py-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    nurse.status === 'available'
                                      ? 'bg-success/10 text-success border-success'
                                      : 'bg-warning/10 text-warning border-warning'
                                  }
                                >
                                  {nurse.status === 'available' ? '🟢' : '🟠'} {nurse.status}
                                </Badge>
                              </td>
                              <td className="py-3 font-mono text-xs">{nurse.assignment || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="beds" className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-2 font-semibold">Bed Number</th>
                            <th className="pb-2 font-semibold">Floor</th>
                            <th className="pb-2 font-semibold">Status</th>
                            <th className="pb-2 font-semibold">Patient</th>
                          </tr>
                        </thead>
                        <tbody>
                          {beds.slice(0, 15).map((bed) => (
                            <tr key={bed.id} className="border-b border-border">
                              <td className="py-3 font-mono">{bed.bed_number}</td>
                              <td className="py-3">{bed.floor}</td>
                              <td className="py-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    bed.status === 'available'
                                      ? 'bg-success/10 text-success border-success'
                                      : bed.status === 'occupied'
                                      ? 'bg-emergency/10 text-emergency border-emergency'
                                      : bed.status === 'icu'
                                      ? 'bg-icu/10 text-icu border-icu'
                                      : 'bg-warning/10 text-warning border-warning'
                                  }
                                >
                                  {bed.status}
                                </Badge>
                              </td>
                              <td className="py-3">{bed.patient || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="doctors" className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-2 font-semibold">Name</th>
                            <th className="pb-2 font-semibold">ID</th>
                            <th className="pb-2 font-semibold">Specialization</th>
                            <th className="pb-2 font-semibold">Status</th>
                            <th className="pb-2 font-semibold">Assignment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctors.map((doctor) => (
                            <tr key={doctor.id} className="border-b border-border">
                              <td className="py-3">{doctor.name}</td>
                              <td className="py-3 font-mono text-xs">{doctor.doctor_id}</td>
                              <td className="py-3">{doctor.specialization}</td>
                              <td className="py-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    doctor.status === 'available'
                                      ? 'bg-success/10 text-success border-success'
                                      : 'bg-warning/10 text-warning border-warning'
                                  }
                                >
                                  {doctor.status === 'available' ? '🟢' : '🟠'} {doctor.status}
                                </Badge>
                              </td>
                              <td className="py-3 font-mono text-xs">{doctor.assignment || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-secondary/50">
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Bed Occupancy Rate</p>
                            <p className="text-3xl font-bold mt-2">
                              {Math.round(((beds.length - availableBeds) / beds.length) * 100)}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-secondary/50">
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Avg Response Time</p>
                            <p className="text-3xl font-bold mt-2">3.2 min</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-secondary/50">
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Today's Emergencies</p>
                            <p className="text-3xl font-bold mt-2">{emergencies.length}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-secondary/50">
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Staff Efficiency</p>
                            <p className="text-3xl font-bold mt-2">94%</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
