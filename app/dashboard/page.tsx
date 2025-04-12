'use client'

import { Badge } from '@/app/components/badge';

interface Stat {
  label: string
  value: string | number
  labelBadge?: string
  valueBadge?: string
}

const stats: Stat[] = [
  { label: 'Net Daily Sales', value: '$22.84K', labelBadge: '+12%', valueBadge: '↑' },
  { label: 'Labor', value: '$79.29k', labelBadge: '+2%', valueBadge: '↑'},
  { label: 'Bartender Hourly', value: '$187.93k', labelBadge: '-7%', valueBadge: '↓'},
  { label: 'Net Week Sales', value: '$1.32M', labelBadge: '+1', valueBadge: '↑'}
]

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
          {/* Revenue Stat Header Section */}
          <section>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    <span>{stat.label}</span>
                    {stat.valueBadge && (
                      <Badge color={stat.valueBadge === '↑' ? 'green' : 'red'}>
                        {stat.valueBadge}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 flex items-center text-2xl font-semibold text-zinc-950 dark:text-white">
                    <div className="flex-1">{stat.value}</div>
                    <div className="flex-1 flex justify-center">
                      {stat.labelBadge && (
                        <Badge color={String(stat.labelBadge).startsWith('-') ? 'red' : 'green'}>
                          {stat.labelBadge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 text-right text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      Last week
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
      </div>
  );
}
