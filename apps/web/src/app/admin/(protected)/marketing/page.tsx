'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Users, UserX, MessageSquare, Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

type Tab = 'subscribers' | 'messages';

export default function AdminMarketingPage() {
  const [tab, setTab]       = useState<Tab>('subscribers');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]     = useState(1);
  const qc = useQueryClient();

  // Subscribers
  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['admin-subscribers', search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', page: String(page) });
      if (search)       params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await adminFetch(`${API}/api/admin/marketing/subscribers?${params}`);
      return res.json();
    },
    enabled: tab === 'subscribers',
  });

  // Contact messages
  const { data: msgData, isLoading: msgLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/admin/marketing/contact-messages?limit=50`);
      return res.json();
    },
    enabled: tab === 'messages',
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await adminFetch(`${API}/api/admin/marketing/subscribers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscribers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`${API}/api/admin/marketing/subscribers/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscribers'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`${API}/api/admin/marketing/contact-messages/${id}/read`, {
        method: 'PATCH',
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const subscribers = subData?.data?.subscribers ?? [];
  const subStats    = subData?.data?.stats ?? {};
  const messages    = msgData?.data?.messages ?? [];

  return (
    <div>
      {/* Stats bar */}
      {tab === 'subscribers' && subStats.total > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
              <Users size={16} className="text-honey-500" />
            </div>
            <div>
              <p className="font-satoshi text-gray-400 text-xs">Total</p>
              <p className="font-satoshi text-gray-800 font-semibold">{subStats.total ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <Mail size={16} className="text-green-500" />
            </div>
            <div>
              <p className="font-satoshi text-gray-400 text-xs">Active</p>
              <p className="font-satoshi text-green-700 font-semibold">{subStats.active ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
              <UserX size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="font-satoshi text-gray-400 text-xs">Unsubscribed</p>
              <p className="font-satoshi text-gray-500 font-semibold">{subStats.inactive ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('subscribers')}
          className={`flex items-center gap-2 font-satoshi text-sm px-4 py-2 rounded-lg transition-colors ${
            tab === 'subscribers'
              ? 'bg-honey-400 text-midnight font-semibold'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-honey-300'
          }`}
        >
          <Mail size={14} /> Subscribers
        </button>
        <button
          onClick={() => setTab('messages')}
          className={`flex items-center gap-2 font-satoshi text-sm px-4 py-2 rounded-lg transition-colors ${
            tab === 'messages'
              ? 'bg-honey-400 text-midnight font-semibold'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-honey-300'
          }`}
        >
          <MessageSquare size={14} /> Contact Messages
        </button>
      </div>

      {/* Subscribers tab */}
      {tab === 'subscribers' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search email..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Unsubscribed</option>
            </select>
          </div>

          {subLoading ? (
            <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    {['Email', 'Source', 'Status', 'Subscribed', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscribers.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm">{sub.email}</td>
                      <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs capitalize">
                        {sub.source ?? 'website'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-satoshi font-medium px-2 py-0.5 rounded-full ${
                          sub.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {sub.is_active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">
                        {new Date(sub.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMutation.mutate({ id: sub.id, is_active: !sub.is_active })}
                            disabled={toggleMutation.isPending}
                            className="text-gray-400 hover:text-honey-500 transition-colors"
                            title={sub.is_active ? 'Unsubscribe' : 'Resubscribe'}
                          >
                            {sub.is_active
                              ? <ToggleRight size={18} className="text-green-500" />
                              : <ToggleLeft size={18} />
                            }
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(sub.id)}
                            disabled={deleteMutation.isPending}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 font-satoshi text-gray-400">
                        No subscribers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <>
          {msgLoading ? (
            <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`bg-white rounded-xl border p-5 transition-colors ${
                    msg.is_read ? 'border-gray-100' : 'border-honey-200 bg-honey-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-satoshi text-gray-800 font-semibold text-sm">{msg.name}</span>
                        {!msg.is_read && (
                          <span className="text-[10px] bg-honey-400 text-midnight font-satoshi font-bold px-1.5 py-0.5 rounded">
                            NEW
                          </span>
                        )}
                        <span className="font-satoshi text-gray-400 text-xs">
                          {new Date(msg.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="font-satoshi text-gray-400 text-xs mb-2">
                        {msg.email}{msg.phone && ` · ${msg.phone}`}
                      </p>
                      {msg.subject && (
                        <p className="font-satoshi text-gray-700 text-sm font-medium mb-1">{msg.subject}</p>
                      )}
                      <p className="font-satoshi text-gray-600 text-sm leading-relaxed">{msg.message}</p>
                    </div>
                    {!msg.is_read && (
                      <button
                        onClick={() => markReadMutation.mutate(msg.id)}
                        className="shrink-0 font-satoshi text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
                  <p className="font-satoshi text-gray-400">No contact messages</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
