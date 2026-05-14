import React, { useState } from 'react';
import { Button, InputNumber, Space, Typography } from 'antd';
import { formatMoney, EMPTY_COSTS } from '../utils/utils';
import { Costs } from '../types/sales';

const { Text } = Typography;

interface CostsFormProps {
    initial: Costs;
    onApply: (costs: Costs) => Promise<void>;
    onCancel: () => void;
    netRevenue: number;
    currencySymbol?: string;
}

const COST_FIELDS: { key: keyof Omit<Costs, 'physicalProfit'>; label: string }[] = [
    { key: 'tracks',    label: 'Tracks' },
    { key: 'art',       label: 'Art' },
    { key: 'mastering', label: 'Mastering' },
    // { key: 'physical',  label: 'Physical (CDs, USBs etc)' },
    { key: 'others',    label: 'Others' },
];

const parseMoney = (value: any) =>
    String(value).replace(/[^0-9.\-]/g, '');

export const CostsForm: React.FC<CostsFormProps> = ({
    initial,
    onApply,
    onCancel,
    netRevenue,
    currencySymbol = '€',
}) => {
    const [costs, setCosts] = useState<Costs>({ ...EMPTY_COSTS, ...initial });

    const [saving, setSaving] = useState(false);

    const setField = (key: keyof Costs) => (v: any) =>
        setCosts(prev => ({ ...prev, [key]: Number(v || 0) }));

    const totalCosts =
        costs.tracks + costs.art + costs.mastering + costs.physical + costs.others;

    const totalIncome = Number(netRevenue || 0) - totalCosts + costs.physicalProfit;

    const handleApply = async () => {
        setSaving(true);
        try {
            await onApply(costs);
        } catch (error) {
            console.error('Failed to save costs:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }}>

            {COST_FIELDS.map(({ key, label }) => (
                <div key={key}>
                    <div style={{ marginBottom: 8 }}>{label}</div>
                    
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={costs[key]}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={parseMoney}
                        onChange={setField(key)}
                    />
                </div>
            ))}

            <div style={{ fontWeight: 'bold' }}>
                <div style={{ marginBottom: 8 }}>TOTAL Costs</div>

                <InputNumber
                    style={{ width: '100%' }}
                    value={totalCosts}
                    readOnly
                    formatter={(value: any) => formatMoney(Number(value || 0), currencySymbol)}
                />
            </div>

            <hr style={{ marginTop: 8 }}/>

            <div>
                <div style={{ marginBottom: 8 }}>Income from physical sales</div>

                <InputNumber
                    style={{ width: '100%' }}
                    value={costs.physicalProfit}
                    formatter={(value: any) => `${currencySymbol} ${value}`}
                    parser={parseMoney}
                    onChange={setField('physicalProfit')}
                />
            </div>

            <div style={{ fontWeight: 'bold' }}>
                <div style={{ marginBottom: 8 }}>
                    TOTAL Income = Bandcamp Income − TOTAL Costs + Income from physical sales
                </div>

                <Text style={{ color: totalIncome >= 0 ? 'green' : 'red' }}>
                    {formatMoney(totalIncome, currencySymbol)}
                </Text>
            </div>

            <Space style={{ marginTop: 8 }}>
                <Button onClick={onCancel}>Cancel</Button>

                <Button type="primary" onClick={handleApply} loading={saving}>
                    Save
                </Button>
            </Space>
        </Space>
    );
};