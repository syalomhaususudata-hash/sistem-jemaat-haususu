import React, { useState } from 'react';

export default function LoginScreen({ onLogin, penatuaMap, penatuaPassMap, churchProfile, adminPass }) {
  const [role, setRole] = useState('jemaat');
  const [selectedRayon, setSelectedRayon] = useState('1');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); 
    setErrorMsg('');
    
    if (role === 'admin' && password !== adminPass) {
        return setErrorMsg('Password Admin salah!');
    }
    
    if (role === 'penatua') {
       const correctPass = penatuaPassMap[selectedRayon] || 'penatua123';
       if (password !== correctPass) return setErrorMsg('Password Penatua salah!');
    }
    
    onLogin({ role, name: role === 'penatua' ? penatuaMap[selectedRayon] : role });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 bg-white rounded-full shadow-sm p-1" />
          <h1 className="text-2xl font-black text-gray-800 text-center tracking-tight">Sistem Informasi</h1>
          <p className="text-gray-500 font-medium text-center uppercase text-xs mt-2 leading-relaxed">
            {churchProfile?.sinode || 'GMIT'}
            {churchProfile?.klasis ? <><br />KLASIS {churchProfile.klasis}</> : ''}
            {churchProfile?.jemaat ? <><br />JEMAAT {churchProfile.jemaat}</> : <><br />NAMA GEREJA</>}
            {churchProfile?.mataJemaat ? <><br />MATA JEMAAT {churchProfile.mataJemaat}</> : ''}
          </p>
        </div>
        
        {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-semibold text-center">
                {errorMsg}
            </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Masuk Sebagai</label>
              <select 
                value={role} 
                onChange={(e) => { setRole(e.target.value); setPassword(''); setErrorMsg(''); }} 
                className="w-full border p-2 rounded bg-gray-50 text-sm focus:ring-2 outline-none"
              >
                  <option value="jemaat">Jemaat (Read-Only)</option>
                  <option value="penatua">Penatua (Akses Edit Rayon)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
              </select>
          </div>
          
          {role === 'penatua' && (
              <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Pilih Rayon</label>
                  <select 
                    value={selectedRayon} 
                    onChange={(e) => setSelectedRayon(e.target.value)} 
                    className="w-full border p-2 rounded bg-gray-50 text-sm focus:ring-2 outline-none"
                  >
                      {Object.keys(penatuaMap).sort((a,b)=>parseInt(a)-parseInt(b)).map(r => (
                          <option key={r} value={r}>Rayon {r} - {penatuaMap[r]}</option>
                      ))}
                  </select>
              </div>
          )}
          
          {role !== 'jemaat' && (
              <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
                  {/* Sesuai standar: Tidak menggunakan placeholder pada input password */}
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full border p-2 rounded bg-gray-50 text-sm focus:ring-2 outline-none" 
                  />
              </div>
          )}
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-2 shadow-md transition-all">
              Masuk Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}