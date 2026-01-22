import { useState, useEffect } from 'react'
import { apiClient } from '@/utils/api'
import ApplicationsList from '@/components/ApplicationsList'
import { useToast } from '@/components/ui/toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, AlertCircle, Bot } from 'lucide-react'

interface Application {
  id: string
  jobTitle: string
  company: string
  jobUrl?: string
  location?: string
  status: 'pending' | 'applied' | 'interview' | 'rejected'
  appliedDate: string
  files?: { cv: string, cover_letter: string, interview_prep?: string }
}

interface ActiveApplication {
  id: string
  role: string
  company: string
  status: string
  logs: string
  progress: number
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [activeQueue, setActiveQueue] = useState<ActiveApplication[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')

  const fetchApplications = async (p: number) => {
    setLoading(true)
    try {
      const response = await apiClient(`/applications?page=${p}&limit=${limit}`)
      const data = await response.json()
      if (data.applications) {
        setApplications(data.applications)
        setPage(data.page || p)
        setTotal(data.total || data.applications.length)
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
      toast.show({ title: 'Error', description: 'Failed to load applications', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Polling for active queue
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchQueue = async () => {
      try {
        const response = await apiClient('/applications/active');
        const data = await response.json();
        if (data.success) {
          setActiveQueue(data.active_applications);
          // If items moved from active -> completed, refresh history
          if (data.active_applications.length === 0 && activeQueue.length > 0) {
             fetchApplications(1);
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };

    fetchQueue();
    interval = setInterval(fetchQueue, 3000); // Poll every 3s

    return () => clearInterval(interval);
  }, [activeQueue.length]);

  useEffect(() => {
    fetchApplications(1)
  }, [])

  const handleApply = (app: any) => {
    if (typeof app.jobUrl === 'string' && /^https?:\/\//.test(app.jobUrl)) {
      window.open(app.jobUrl, '_blank')
    } else {
      toast.show({ title: 'Info', description: 'Link invalid.', variant: 'default' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Application Factory
        </h1>
        <p className="text-muted-foreground">Monitor your AI agents and track application history</p>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="queue" className="relative">
            Live Queue
            {activeQueue.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white animate-pulse">
                {activeQueue.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6 space-y-6">
          {activeQueue.length === 0 ? (
             <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Bot className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Factory Floor is Quiet</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        No active agents running. Go to "Job Matches" and use "Auto-Apply" to queue up some tasks!
                    </p>
                </CardContent>
             </Card>
          ) : (
            <div className="grid gap-4">
                {activeQueue.map((app) => (
                    <Card key={app.id} className="border-l-4 border-l-blue-500 shadow-md overflow-hidden relative">
                        {/* Background Pulse Effect for Active Items */}
                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-transparent pointer-events-none" />
                        
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{app.role}</CardTitle>
                                    <CardDescription className="text-base font-medium text-blue-400">
                                        {app.company}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="animate-pulse bg-blue-500/10 text-blue-400 border-blue-500/20">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Processing
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Agent Status</span>
                                        <span>{app.status}</span>
                                    </div>
                                    <Progress value={app.progress} className="h-2" />
                                </div>
                                
                                <div className="bg-black/20 rounded-md p-3 font-mono text-xs text-green-400 truncate">
                                    $ agent_log: {app.logs || "Initializing..."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {loading && applications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Loading history...</div>
          ) : (
            <ApplicationsList
                applications={applications}
                API_ORIGIN={API_ORIGIN}
                onApply={handleApply}
                serverPage={page}
                serverTotalPages={Math.max(1, Math.ceil(total / limit))}
                onPageChange={(p) => fetchApplications(p)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
