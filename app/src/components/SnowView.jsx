// Snow screen. Progressive disclosure: every card face shows ≤3 data points (label · primary metric · status badge);
// secondary metadata, timestamps and controls live in each card's expandable detail drawer.
import React from 'react';
import { Card, LoadoutCard, OfflineBanner, SectionTitle, SourcesCard, WindowCard } from './ui.jsx';

export default function SnowView({ v, sn, ic, openDrawer, refresh }) {
  return (
    <>
      <OfflineBanner show={v.offline} text={v.offlineTxt} icon={ic.cloudOff} />

      <Card hero label={sn.name} value={sn.fresh + '″'} unit="fresh" badge={{ text: sn.pill, bg: sn.pillBg, fg: sn.pillFg }} mt={0}
        rows={[{ k: 'As of', v: sn.eyebrow }, { k: 'Conditions', v: sn.words }, { k: 'Last 48 h', v: sn.fresh48 }, { k: 'Base depth', v: sn.depth }, { k: 'Mountain', v: sn.area }, { k: 'Lifts', v: sn.lifts }]} />

      <SectionTitle>By elevation</SectionTitle>
      {sn.ladder.map((lv, i) => (
        <Card key={lv.label} label={lv.label} value={lv.wind} badge={{ text: lv.chip, bg: lv.chipBg, fg: lv.chipFg }} mt={i ? 10 : 12}
          rows={[{ k: 'Elevation', v: lv.elev }, { k: 'Temperature', v: lv.temp }, { k: 'Gusts · from', v: lv.gust }, { k: 'As of', v: sn.at }]} />
      ))}

      <Card label="Surface now" value={sn.surfaceNow} mt={10}
        rows={sn.steps.map(ss => ({ k: ss.label, v: ss.range, color: ss.fg }))} />

      <WindowCard win={sn.win} />
      <LoadoutCard text={sn.teaser} onOpen={openDrawer} />
      <SourcesCard v={v} footnote={sn.footnote} refresh={refresh} />
    </>
  );
}
