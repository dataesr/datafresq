export default function RawData({ data }: { data: any }) {
  return (
    <section className="fr-accordion">
      <h3 className="fr-accordion__title">
        <button
          type="button"
          className="fr-accordion__btn"
          aria-expanded="false"
          aria-controls="accordion-1"
        >
          Données brutes
        </button>
      </h3>
      <div id="accordion-1" className="fr-collapse">
        <pre>
          <code
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      </div>
    </section>
  );
}
