import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useForm } from 'react-hook-form';
import { Plus, Search, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Processo {
  id: string;
  empresa: string;
  produto: string;
  protocolo: string;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'com_pendencias';
  resolucao_numero: string | null;
  data_publicacao: string | null;
  link_dou: string | null;
}

export default function Monitoramento() {
  const { user } = useAuth();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [method, setMethod] = useState<'termo' | 'protocolo'>('termo');
  const [termsInput, setTermsInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchProcessos();
  }, [user]);

  async function fetchProcessos() {
    try {
      const { data, error } = await supabase
        .from('processos_monitorados')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProcessos(data || []);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runSearch() {
    setSearching(true)
    setResults([])
    const terms = termsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    try {
      const res = await fetch('/api/dou/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, terms }),
      })
      const data = await res.json()
      setResults(data?.data || [])
    } catch (e) {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  async function monitorarResultado(r: any) {
    try {
      const { error } = await supabase.from('processos_monitorados').insert([
        {
          user_id: user?.id,
          empresa: r.consulta,
          produto: r.consulta,
          protocolo: r.consulta,
          status: r.situacao || 'pendente',
          resolucao_numero: r.resolucao_numero,
          data_publicacao: r.data_publicacao,
          link_dou: r.link,
        },
      ])
      if (error) throw error
      fetchProcessos()
    } catch (e) {
    }
  }

  async function onSubmit(data: any) {
    try {
      const { error } = await supabase.from('processos_monitorados').insert([
        {
          user_id: user?.id,
          empresa: data.empresa,
          produto: data.produto,
          protocolo: data.protocolo,
          status: 'pendente'
        }
      ]);

      if (error) throw error;
      
      setIsModalOpen(false);
      reset();
      fetchProcessos();
    } catch (error) {
      alert('Erro ao cadastrar processo');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este monitoramento?')) return;

    try {
      const { error } = await supabase
        .from('processos_monitorados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProcessos();
    } catch (error) {
      alert('Erro ao remover processo');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'reprovado': return 'bg-red-100 text-red-800';
      case 'com_pendencias': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoramento de Resultados</h1>
          <p className="text-gray-600">Acompanhe seus processos regulatórios no DOU</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Novo Monitoramento
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={method === 'termo'}
              onChange={() => setMethod('termo')}
            />
            Termo (produto/empresa)
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={method === 'protocolo'}
              onChange={() => setMethod('protocolo')}
            />
            Número de protocolo/expediente
          </label>
        </div>
        <div>
          <div className="flex items-center mb-2">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Cole múltiplos itens (um por linha)</span>
          </div>
          <textarea
            rows={6}
            value={termsInput}
            onChange={(e) => setTermsInput(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Exemplos:\nDipirona Sódica\nLaboratório XYZ\n25351.123456/2023-99"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={runSearch}
            disabled={searching || termsInput.trim().length === 0}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {searching ? 'Pesquisando...' : 'Pesquisar no DOU'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Resultados da Pesquisa</h2>
            <span className="text-sm text-gray-500">{results.length} itens</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consulta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolução</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situação</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {r.consulta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {r.resolucao_numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {r.data_publicacao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {r.situacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <a href={r.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900">
                          <ExternalLink size={18} />
                        </a>
                        <button
                          onClick={() => monitorarResultado(r)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Monitorar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto / Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolução</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Carregando processos...
                  </td>
                </tr>
              ) : processos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-12 w-12 text-gray-300 mb-4" />
                      <p>Nenhum processo monitorado encontrado.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 text-indigo-600 hover:text-indigo-500"
                      >
                        Comece adicionando um novo
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                processos.map((processo) => (
                  <tr key={processo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {processo.protocolo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{processo.produto}</div>
                      <div className="text-xs text-gray-400">{processo.empresa}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(processo.status)}`}>
                        {processo.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {processo.resolucao_numero ? (
                        <div className="flex flex-col">
                          <span>{processo.resolucao_numero}</span>
                          <span className="text-xs">{processo.data_publicacao}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Aguardando pub.</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {processo.link_dou && (
                          <a href={processo.link_dou} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900" title="Ver no DOU">
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button onClick={() => handleDelete(processo.id)} className="text-red-600 hover:text-red-900" title="Remover">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Novo Monitoramento
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Número do Protocolo/Expediente</label>
                          <input
                            type="text"
                            required
                            {...register('protocolo')}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                            placeholder="Ex: 25351.123456/2023-99"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                          <input
                            type="text"
                            required
                            {...register('produto')}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                            placeholder="Ex: Dipirona Sódica"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Empresa Detentora</label>
                          <input
                            type="text"
                            required
                            {...register('empresa')}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                            placeholder="Ex: Laboratório XYZ Ltda"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Monitorar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
