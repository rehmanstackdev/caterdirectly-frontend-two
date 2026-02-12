

import RealSystemPerformance from "./RealSystemPerformance";
import RealRecentActivities from "./RealRecentActivities";

const PerformanceSection = () => {
  console.log("PerformanceSection: Rendering with real data components");
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <RealSystemPerformance />
      <div className="lg:col-span-2">
        <RealRecentActivities />
      </div>
    </div>
  );
};

export default PerformanceSection;
