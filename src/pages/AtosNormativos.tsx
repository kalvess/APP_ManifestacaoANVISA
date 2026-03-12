import React, { useEffect, useState } from 'react';
import { Search, Download, Share2, Filter, FileText } from 'lucide-react';

export default function AtosNormativos() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [atos, setAtos] = useState<any[]>([]);

  useEffect(() => {
    fetchAtos();
  }, []);

  async function fetchAtos() {
    try {
      const res = await fetch('/api/atos/search')
      const data = await res.json()
      setAtos(data?.data || []);
    } catch (e) {
      setAtos([]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Busca de Atos Normativos</h1>
          <p className="text-gray-600">Pesquise resoluções, portarias e instruções normativas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900">Filtros</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                  <option value="">Todas</option>
                  <option value="medicamentos">Medicamentos</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="cosmeticos">Cosméticos</option>
                  <option value="saneantes">Saneantes</option>
                  <option value="dispositivos">Dispositivos Médicos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ato</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-600">RDC</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-600">Instrução Normativa</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-600">Portaria</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                <input type="date" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 mb-2" />
                <input type="date" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
              </div>

              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Input */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Busque por palavras-chave, número do ato ou tema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Results List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {atos.map((ato: any) => (
              <div key={ato.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ato.categoria}
                      </span>
                      <span className="text-sm text-gray-500">{ato.data}</span>
                      <span className="text-sm text-gray-500">• {ato.orgao}</span>
                    </div>
                    <h3 className="text-lg font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
                      {ato.numero}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {ato.titulo}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Download PDF">
                      <Download size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Compartilhar">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center py-4">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Anterior
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </a>
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Próxima
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
