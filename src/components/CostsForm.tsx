import React, { useState } from 'react';
import { Button, InputNumber, Space, Typography } from 'antd';

const { Text } = Typography;

export type CostsFormData = {
    tracks: number;
    art: number;
    mastering: number;
    physical: number;
    others: number;
    physicalProfit: number;
};

interface CostsFormProps {
    initial: CostsFormData;
    onApply: (costs: CostsFormData) => Promise<void>;
    onCancel: () => void;
    netRevenue: number;
    currencySymbol?: string;
}

export const CostsForm: React.FC<CostsFormProps> = ({
    initial,
    onApply,
    onCancel,
    netRevenue,
    currencySymbol = '€',
}) => {
    const [tracks, setTracks] = useState<number>(initial.tracks || 0);
    const [art, setArt] = useState<number>(initial.art || 0);
    const [mastering, setMastering] = useState<number>(initial.mastering || 0);
    const [physical, setPhysical] = useState<number>(initial.physical || 0);
    const [others, setOthers] = useState<number>(initial.others || 0);
    const [physicalProfit, setPhysicalProfit] = useState<number>(initial.physicalProfit || 0);
    const [saving, setSaving] = useState(false);

    const total =
        Number(tracks || 0) +
        Number(art || 0) +
        Number(mastering || 0) +
        Number(others || 0) +
        Number(physical || 0);
    const profit = Number(netRevenue || 0) - total + Number(physicalProfit || 0);

    const handleApply = async () => {
        setSaving(true);
        try {
            await onApply({
                tracks,
                art,
                mastering,
                physical,
                others,
                physicalProfit,
            });
        } catch (error) {
            console.error('Failed to save costs:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <div style={{ marginBottom: 8 }}>Tracks</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={tracks}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={(value: any) =>
                            String(value).replace(/[^0-9.\-]/g, '')
                        }
                        onChange={(v: any) => setTracks(Number(v || 0))}
                    />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Art</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={art}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={(value: any) =>
                            String(value).replace(/[^0-9.\-]/g, '')
                        }
                        onChange={(v: any) => setArt(Number(v || 0))}
                    />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Mastering</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={mastering}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={(value: any) =>
                            String(value).replace(/[^0-9.\-]/g, '')
                        }
                        onChange={(v: any) => setMastering(Number(v || 0))}
                    />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Physical (CDs, USBs etc)</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={physical}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={(value: any) =>
                            String(value).replace(/[^0-9.\-]/g, '')
                        }
                        onChange={(v: any) => setPhysical(Number(v || 0))}
                    />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Others</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={others}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={(value: any) =>
                            String(value).replace(/[^0-9.\-]/g, '')
                        }
                        onChange={(v: any) => setOthers(Number(v || 0))}
                    />
                </div>

                <div style={{ fontWeight: 'bold' }}>
                    <div style={{ marginBottom: 8 }}>TOTAL Costs</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        value={total}
                        readOnly
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                    />
                </div>

                <hr />

                <div>
                    <div style={{ marginBottom: 8 }}>Income from physical sales</div>
                    <InputNumber
                        style={{ width: '100%' }}
                        value={physicalProfit}
                        formatter={(value: any) => `${currencySymbol} ${value}`}
                        parser={(value: any) =>
                            String(value).replace(/[^0-9.\-]/g, '')
                        }
                        onChange={(v: any) => setPhysicalProfit(Number(v || 0))}
                    />
                </div>

                <div style={{ fontWeight: 'bold' }}>
                    <div style={{ marginBottom: 8 }}>
                        TOTAL Income = Bandcamp Income - TOTAL Costs + Income
                        from physical sales
                    </div>
                    <Text style={{ color: profit >= 0 ? 'green' : 'red' }}>
                        {profit >= 0
                            ? currencySymbol + profit.toFixed(2)
                            : currencySymbol + profit.toFixed(2)}
                    </Text>
                </div>

                <Space style={{ marginTop: 8 }}>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" onClick={handleApply} loading={saving}>
                        Save
                    </Button>
                </Space>
            </Space>
        </div>
    );
};
