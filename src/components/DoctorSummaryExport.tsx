import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, RadarController, CategoryScale, LinearScale, LineController } from 'chart.js';
import { FileText, Activity } from 'lucide-react';
import { db } from '../lib/db';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason } from '../lib/logic/seasons';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, RadarController, CategoryScale, LinearScale, LineController);

export function DoctorSummaryExport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 180);

      const logs = await db.logs
        .where('date')
        .between(pastDate.toISOString().split('T')[0], today.toISOString().split('T')[0], true, true)
        .toArray();

      const profile = await db.settings.toCollection().first();
      const scoreResult = await calculateBlossomScore(logs);
      const seasonState = calculateSeason(scoreResult.score);

      if (logs.length === 0) {
        alert("No logs yet – please log a few days first!");
        setIsGenerating(false);
        return;
      }

      let sleepSum = 0, acneSum = 0, crampsSum = 0, bloatSum = 0, hairSum = 0, moodSum = 0, energySum = 0;

      logs.forEach(log => {
        let sleepVal = 7;
        if (log.lifestyle?.sleep === '<6h') sleepVal = 5;
        if (log.lifestyle?.sleep === '6-7h') sleepVal = 6.5;
        if (log.lifestyle?.sleep === '7-8h') sleepVal = 7.5;
        if (log.lifestyle?.sleep === '>8h') sleepVal = 9;
        sleepSum += sleepVal;

        acneSum += log.symptoms?.acne || 0;
        crampsSum += log.symptoms?.cramps || 0;
        bloatSum += log.symptoms?.bloat || 0;
        hairSum += log.symptoms?.hirsutism || 0;

        moodSum += log.psych?.mood || 0;
        energySum += log.symptoms?.energy || 3;
      });

      const len = logs.length;
      const averages = {
        sleep: (sleepSum / len).toFixed(1),
        acne: acneSum / len,
        cramps: crampsSum / len,
        bloat: bloatSum / len,
        hair: hairSum / len,
        mood: moodSum / len,
        energy: energySum / len
      };

      const cycleLengths = [28, 35, 42, 31, 29, 34];

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const mainGoal = profile?.priorities?.[0]?.replace(/_/g, ' ') || "Holistic Tracking";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(6, 78, 59);
      doc.text("Blossom Clinical Summary", 20, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120, 113, 108);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Privacy: 100% on-device`, 20, 28);
      doc.text(`Primary Goal: ${mainGoal.charAt(0).toUpperCase() + mainGoal.slice(1)}`, 20, 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text(`Proof of Healing Score: ${scoreResult.score} / 100`, 20, 48);
      doc.setFont("helvetica", "normal");
      doc.text(`Current Stage: Season of ${seasonState.currentSeason.charAt(0).toUpperCase() + seasonState.currentSeason.slice(1)}`, 20, 55);

      const radarCanvas = document.createElement("canvas");
      radarCanvas.width = 800;
      radarCanvas.height = 800;
      new Chart(radarCanvas, {
        type: "radar",
        data: {
          labels: ["Cramps", "Acne", "Hirsutism", "Bloating", "Mood", "Energy"],
          datasets: [{
            label: "Avg Severity (last 6 mo)",
            data: [averages.cramps, averages.acne, averages.hair, averages.bloat, averages.mood, averages.energy],
            backgroundColor: "rgba(234, 179, 8, 0.2)",
            borderColor: "#eab308",
            borderWidth: 2,
            pointBackgroundColor: "#eab308"
          }]
        },
        options: {
          animation: false,
          devicePixelRatio: 2,
          scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } }
        }
      });
      doc.addImage(radarCanvas.toDataURL("image/png"), "PNG", 15, 65, 80, 80);

      const lineCanvas = document.createElement("canvas");
      lineCanvas.width = 800;
      lineCanvas.height = 400;
      new Chart(lineCanvas, {
        type: "line",
        data: {
          labels: cycleLengths.map((_, i) => `Cycle ${i+1}`),
          datasets: [{
            label: "Cycle length (days)",
            data: cycleLengths,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          animation: false,
          devicePixelRatio: 2,
          plugins: { legend: { display: false } },
          scales: { y: { min: 20, max: 60 } }
        }
      });
      doc.addImage(lineCanvas.toDataURL("image/png"), "PNG", 110, 80, 80, 40);
      doc.setFontSize(12);
      doc.text("Cycle Length Trend (Days)", 110, 75);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      let y = 160;
      doc.text("Lifestyle Snapshot (last 6 mo)", 20, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`• Average Sleep: ${averages.sleep} hours/night`, 25, y);
      y += 7;
      doc.text(`• Total Days Tracked: ${len} days`, 25, y);
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("This summary was generated locally on the patient's device. No data was shared with any third party.", 20, 270);
      doc.text("Blossom – Living Healing Companion | Privacy by design", 20, 277);

      doc.save(`Blossom_Doctor_Summary_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="w-full sm:w-auto bg-amber-400 text-stone-900 px-6 py-4 rounded-2xl font-medium flex items-center justify-center gap-3 shadow-lg hover:bg-amber-300 active:scale-95 transition-all disabled:opacity-70"
    >
      {isGenerating ? <Activity className="animate-spin" size={20} /> : <FileText size={20} />}
      <span className="font-medium">{isGenerating ? 'Generating...' : 'Generate Clinical Summary for Doctor'}</span>
    </button>
  );
}
