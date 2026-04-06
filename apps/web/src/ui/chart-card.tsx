import { select, scaleBand, scaleLinear, max } from 'd3';
import { useEffect, useRef } from 'react';

type ChartDatum = {
  label: string;
  value: number;
};

type ChartCardProps = {
  title: string;
  subtitle: string;
  data: ChartDatum[];
};

const width = 520;
const height = 260;
const margin = { top: 24, right: 16, bottom: 48, left: 16 };

export const ChartCard = ({ title, subtitle, data }: ChartCardProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const safeData = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const xScale = scaleBand<string>()
      .domain(safeData.map((item) => item.label))
      .range([margin.left, width - margin.right])
      .padding(0.18);

    const yMax = max(safeData, (item) => item.value) ?? 0;
    const yScale = scaleLinear()
      .domain([0, Math.max(yMax, 1)])
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .selectAll('rect')
      .data(safeData)
      .join('rect')
      .attr('x', (item) => xScale(item.label) ?? 0)
      .attr('y', (item) => yScale(item.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (item) => height - margin.bottom - yScale(item.value))
      .attr('rx', 12)
      .attr('fill', 'url(#chart-gradient)');

    svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'chart-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#7dd3fc' },
        { offset: '100%', color: '#6366f1' },
      ])
      .join('stop')
      .attr('offset', (item) => item.offset)
      .attr('stop-color', (item) => item.color);

    svg
      .append('g')
      .selectAll('text')
      .data(safeData)
      .join('text')
      .attr('x', (item) => (xScale(item.label) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', height - 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 12)
      .text((item) => item.label);

    svg
      .append('g')
      .selectAll('text.value')
      .data(safeData)
      .join('text')
      .attr('x', (item) => (xScale(item.label) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', (item) => yScale(item.value) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .text((item) => item.value);
  }, [safeData]);

  return (
    <section className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
      />
    </section>
  );
};
