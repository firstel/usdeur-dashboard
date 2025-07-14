import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [strategy, setStrategy] = useState('MACD');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const resData = await fetch('/api/data');
        const jsonData = await resData.json();
        setData(Array.isArray(jsonData) ? jsonData : []);

        const resSignals = await fetch(`/api/signals?strategy=${strategy}`);
        const jsonSignals = await resSignals.json();
        setSignals(Array.isArray(jsonSignals) ? jsonSignals : []);

        const resStats = await fetch(`/api/trades`);
        const jsonStats = await resStats.json();
        setStats(jsonStats.stats || {});
        setError(null);
      } catch (err) {
        console.error('API fetch failed:', err);
        setError('Failed to load data from backend.');
        setData([]);
        setSignals([]);
        setStats({});
      }
    };

    fetchAll();
  }, [strategy]);

  return (
    <main style={{ padding: 20 }}>
      <h1>USD/EUR Trading Dashboard</h1>

      <label>
        Select Strategy:{' '}
        <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
          <option value='MACD'>MACD</option>
          <option value='RSI'>RSI</option>
          <option value='MA'>Moving Avg Cross</option>
        </select>
      </label>

      {error && (
        <div style={{ color: 'red', marginTop: 10 }}>
          <strong>{error}</strong>
        </div>
      )}

      <section style={{ marginTop: 20 }}>
        <h2>Stats</h2>
        <p>Total Return: {stats?.total_return?.toFixed(2) ?? '–'}x</p>
        <p>Avg PnL %: {stats?.avg_pnl_pct?.toFixed(2) ?? '–'}%</p>
        <p>
          Win Rate: {stats?.win_rate ? (stats.win_rate * 100).toFixed(1) : '–'}%
        </p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Latest Signals</h2>
        <pre style={{ background: '#f0f0f0', padding: 10, overflow: 'auto' }}>
          {signals.length > 0
            ? JSON.stringify(signals.slice(-10), null, 2)
            : 'No data'}
        </pre>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Recent Prices</h2>
        <pre style={{ background: '#f0f0f0', padding: 10, overflow: 'auto' }}>
          {data.length > 0
            ? JSON.stringify(data.slice(-10), null, 2)
            : 'No data'}
        </pre>
      </section>
    </main>
  );
}
