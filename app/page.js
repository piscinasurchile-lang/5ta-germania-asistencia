export const dynamic = "force-static";

export default function Page() {
  return (
    <main style={{ margin: 0, width: "100%", minHeight: "100dvh", overflow: "hidden" }}>
      <iframe
        title="Asistencia · 5ta Compañía"
        src="/legacy/index.html"
        style={{ border: 0, width: "100%", height: "100dvh", display: "block" }}
      />
    </main>
  );
}
