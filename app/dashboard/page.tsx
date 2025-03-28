'use client'

import { Badge } from '@/app/components/badge'

interface Stat {
  label: string
  value: string | number
  labelBadge?: string
  valueBadge?: string
}

const stats: Stat[] = [
  { label: 'Net Sales', value: '$22.84K', labelBadge: '+12%', valueBadge: '↑' },
  { label: 'Labor', value: '$455.26', labelBadge: '5.2%', valueBadge: '↑' },
  { label: 'Bartender Hourly', value: '52.16', labelBadge: '-3%', valueBadge: '↓' },
  { label: 'Bartender Tip %', value: '21.2%', labelBadge: '+20%', valueBadge: '↑' },
]

export default function RevenueHeader() {
    return (
        <div className="flex flex-col gap-8">
          {/* Revenue Stat Header Section */}
          <section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700 flex flex-col justify-between"
                >
                  {/* Top: Label and Arrow badge */}
                  <div className="flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    <span>{stat.label}</span>
                    {stat.valueBadge && (
                      <Badge color={stat.valueBadge === '↑' ? 'green' : 'red'}>
                        {stat.valueBadge}
                      </Badge>
                    )}
                  </div>
    
                  {/* Bottom: Value | % Badge | Last week */}
                  <div className="mt-4 flex items-center text-2xl font-semibold text-zinc-950 dark:text-white">
                    <div className="flex-1">{stat.value}</div>
    
                    <div className="flex-1 flex justify-center">
                      {stat.labelBadge && <Badge color="green">{stat.labelBadge}</Badge>}
                    </div>
    
                    <div className="flex-1 text-right text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      Last week
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            {/* e.g., Charts, Tables, or Recent Orders */}
            <div className="text-zinc-700 dark:text-zinc-300 text-sm italic">
              {/* Replace this with your next component charts using d3 framework*/}
              Upcoming: Reservation analytics, charts, etc.
            </div>
          </section>
        </div>
      )
    }
