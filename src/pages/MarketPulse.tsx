import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { analyticsService, type MarketStats } from '@/api/services/analytics.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Briefcase, MapPin, Search, TrendingUp, DollarSign, Users } from 'lucide-react';

const MarketPulse = () => {
  const [role, setRole] = useState('Developer');
  const [location, setLocation] = useState('');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getMarketStats(role, location);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch market stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []); // Initial load

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Pulse</h1>
          <p className="text-muted-foreground mt-2">Real-time insights into the job market.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Role (e.g. Python)" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative flex-1 md:w-64">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Location (Optional)" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={fetchStats} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.avg_salary)}</div>
              <p className="text-xs text-muted-foreground">
                Range: {formatCurrency(stats.salary_range.min)} - {formatCurrency(stats.salary_range.max)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.count}</div>
              <p className="text-xs text-muted-foreground">
                Matching criteria
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Samples</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sample_size_salaries}</div>
              <p className="text-xs text-muted-foreground">
                Jobs with disclosed salary
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Stable</div>
              <p className="text-xs text-muted-foreground">
                Based on recent postings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top In-Demand Skills</CardTitle>
              <CardDescription>Most frequently mentioned skills for this role</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_skills} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {stats.top_skills.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
             <CardHeader>
              <CardTitle>Salary Distribution</CardTitle>
              <CardDescription>Estimated annual salary distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
               {stats.sample_size_salaries > 0 ? (
                 <div className="space-y-4 w-full">
                    <div className="flex justify-between items-center">
                        <span>Min</span>
                        <span className="font-bold">{formatCurrency(stats.salary_range.min)}</span>
                    </div>
                     <div className="w-full bg-secondary h-4 rounded-full overflow-hidden relative">
                         <div 
                            className="bg-primary h-full absolute" 
                            style={{ 
                                left: '20%', 
                                right: '20%' 
                            }} 
                         />
                         {/* Visual representation of avg */}
                         <div 
                            className="bg-white w-1 h-full absolute z-10"
                            style={{ left: '50%' }}
                         />
                     </div>
                      <div className="flex justify-between items-center">
                        <span>Max</span>
                        <span className="font-bold">{formatCurrency(stats.salary_range.max)}</span>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Average: {formatCurrency(stats.avg_salary)}
                    </p>
                 </div>
               ) : (
                   <p className="text-muted-foreground">No salary data available for this selection.</p>
               )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketPulse;
