import { useEffect, useState } from 'react';
import { api } from '@/api/client';

export default function TopicList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.topics.list()
      .then(setTopics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading topics…</p>;
  if (error) return <p className="text-sm text-rose-700">Could not load topics: {error}</p>;

  return (
    <div className="grid gap-3">
      {topics.map((t) => (
        <div key={t.id} className="rounded-xl border p-4">
          <small className="opacity-70">{t.category}</small>
          <h3 className="font-semibold">{t.title}</h3>
          <p className="text-sm">{t.description}</p>
        </div>
      ))}
    </div>
  );
}
