import React, { useState, useEffect } from 'react';
import databaseService from '../../services/DatabaseService';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function BackupManager() {
  const [stats, setStats] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    cargarDatos();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const cargarDatos = async () => {
    try {
      const dbStats = await databaseService.getDatabaseStats();
      setStats(dbStats);
      
      const ultimoBackup = await databaseService.getUltimoBackup();
      setBackups(ultimoBackup ? [ultimoBackup] : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };
  
  const handleBackupManual = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await databaseService.generarBackup();
      setMessage('✅ Backup creado exitosamente');
      await cargarDatos();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async () => {
    setLoading(true);
    
    try {
      await databaseService.exportToJSON();
      setMessage('📥 Backup descargado como JSON');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!window.confirm('¿Estás seguro? Esto reemplazará todos tus datos actuales.')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      await databaseService.importFromJSON(file);
      setMessage('✅ Backup restaurado exitosamente');
      await cargarDatos();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset input
    }
  };
  
  const handleLimpiarDB = async () => {
    if (!window.confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esto borrará TODOS los datos.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await databaseService.limpiarBaseDatos();
      setMessage('🗑️ Base de datos limpiada');
      await cargarDatos();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }
  
  return (
    <div className="backup-manager">
      <h3>💾 Sistema de Backup</h3>
      
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.trabajos.total}</div>
          <div className="stat-label">Trabajos</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.tareas.total}</div>
          <div className="stat-label">Tareas</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.espacio}</div>
          <div className="stat-label">Espacio usado</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.backups.locales}</div>
          <div className="stat-label">Backups locales</div>
        </div>
      </div>
      
      {/* Último backup */}
      {backups.length > 0 && (
        <div className="last-backup">
          <h4>🕒 Último backup:</h4>
          <div className="backup-info">
            <strong>Fecha:</strong> {format(new Date(backups[0].fecha), "PPP 'a las' HH:mm", { locale: es })}
            <br />
            <strong>Tamaño:</strong> {backups[0].tamaño} bytes
            <br />
            <small>
              Hace {formatDistanceToNow(new Date(backups[0].fecha), { locale: es, addSuffix: true })}
            </small>
          </div>
        </div>
      )}
      
      {/* Acciones */}
      <div className="actions-grid">
        <button 
          onClick={handleBackupManual}
          disabled={loading}
          className="btn-backup"
        >
          {loading ? '⏳ Procesando...' : '🔄 Crear Backup Ahora'}
        </button>
        
        <button 
          onClick={handleExport}
          disabled={loading}
          className="btn-export"
        >
          📥 Exportar a JSON
        </button>
        
        <label className="btn-import">
          📂 Importar desde JSON
          <input 
            type="file" 
            accept=".json"
            onChange={handleImport}
            disabled={loading}
          />
        </label>
        
        <button 
          onClick={handleLimpiarDB}
          disabled={loading}
          className="btn-danger"
        >
          🗑️ Limpiar Base de Datos
        </button>
      </div>
      
      {/* Configuración */}
      <div className="config-section">
        <h4>⚙️ Configuración de Backups</h4>
        
        <div className="config-item">
          <label>
            <input type="checkbox" defaultChecked />
            <span>Backup automático cada 24 horas</span>
          </label>
        </div>
        
        <div className="config-item">
          <label>
            <input type="checkbox" defaultChecked />
            <span>Comprimir backups para ahorrar espacio</span>
          </label>
        </div>
        
        <div className="config-item">
          <label>
            <input type="checkbox" />
            <span>Sincronizar con Google Drive (próximamente)</span>
          </label>
        </div>
      </div>
      
      {/* Info Debug */}
      <details className="debug-info">
        <summary>🐛 Información de Debug</summary>
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      </details>
    </div>
  );
}

export default BackupManager;