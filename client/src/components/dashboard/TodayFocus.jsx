import React from 'react';

/**
 * Today's Focus widget with large gradient orange minutes and a 7-day mini bar chart.
 */
export default function TodayFocus({ focusStats }) {
  const minutes = focusStats?.todayMinutes ?? 0;
  const dailyData = focusStats?.dailyBreakdown || [];

  const renderBars = () => {
    // Fallback data if none exists
    const data = dailyData.length > 0 ? dailyData : [
      { date: new Date(Date.now() - 5*24*60*60*1000), minutes: 10 },
      { date: new Date(Date.now() - 4*24*60*60*1000), minutes: 20 },
      { date: new Date(Date.now() - 3*24*60*60*1000), minutes: 15 },
      { date: new Date(Date.now() - 2*24*60*60*1000), minutes: 35 },
      { date: new Date(Date.now() - 1*24*60*60*1000), minutes: 25 },
      { date: new Date(), minutes: minutes }
    ];
    
    const maxVal = Math.max(...data.map(d => d.minutes), 1);
    
    return (
      <div className="mini-bar-chart">
        {data.map((d, index) => {
          const heightPercent = (d.minutes / maxVal) * 100;
          const isTodayBar = index === data.length - 1;
          const dayLabel = new Date(d.date).toLocaleDateString(undefined, { weekday: 'narrow' });
          
          return (
            <div key={index} className="mini-bar-column">
              <div 
                className={`mini-bar-fill-orange ${isTodayBar ? 'active-glowing' : ''}`}
                style={{ height: `${Math.max(heightPercent, 12)}%` }}
                title={`${d.minutes} mins`}
              />
              <span className="mini-bar-label">{dayLabel}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="widget-card widget-focus-card fade-in-up delay-3">
      <h3 className="widget-section-title">
        <span className="widget-title-icon orange">⏱️</span> Focus Today
      </h3>
      
      <div className="widget-focus-main">
        <div className="widget-focus-metric-side">
          <div className="widget-focus-value-gradient">{minutes}</div>
          <div className="widget-focus-label">minutes focused today</div>
        </div>
        
        <div className="widget-focus-chart-side">
          {renderBars()}
        </div>
      </div>
    </div>
  );
}
