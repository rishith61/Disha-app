import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="card text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Stress-Career-AI</p>
        <h1 className="mt-4 text-4xl font-semibold text-primary sm:text-5xl">Stress-aware career guidance.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Evaluate your aptitude, emotional state, and pressure response, then receive practical career recommendations driven by modern language models.
        </p>
        <Link
          to="/assessment"
          className="mt-8 inline-flex rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-indigo-700"
        >
          Start Assessment
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Assess', description: 'Complete cognitive and emotional questions.' },
          { title: 'Simulate', description: 'Respond to pressure scenarios with a timer.' },
          { title: 'Discover', description: 'Review tailored career paths with confidence scores.' },
        ].map((item) => (
          <div key={item.title} className="card">
            <h2 className="mb-2 text-xl font-semibold text-primary">{item.title}</h2>
            <p className="text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Home;
