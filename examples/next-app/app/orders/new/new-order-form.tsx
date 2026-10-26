'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Breadcrumbs, DatePresets } from '@rbalukja15/ui-components';
import { RhfIdAutocomplete, RhfTitleCaseField } from '@rbalukja15/ui-components/rhf';
import { RhfDatePickerField } from '@rbalukja15/ui-components/date-picker/rhf';
import { customers } from '@/lib/data';
import { useOrders } from '@/lib/orders-store';

interface NewOrderValues {
  customerId: number | null;
  contact: string;
  items: string;
  total: string;
  deliverBy: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function NewOrderForm() {
  const router = useRouter();
  const { add } = useOrders();
  const { control, handleSubmit, register, setValue, getValues, formState } = useForm<NewOrderValues>({
    defaultValues: { customerId: null, contact: '', items: '1', total: '', deliverBy: '' },
  });

  const onSubmit = handleSubmit(({ customerId, ...values }) => {
    // The field is required, so this only guards the type.
    if (customerId === null) return;
    const order = add({
      customerId,
      status: 'pending',
      items: Number(values.items),
      total: Number(values.total),
      placed: today(),
      deliverBy: values.deliverBy,
    });
    router.push(`/orders?q=${order.id}`);
  });

  return (
    <Stack spacing={2} sx={{ maxWidth: 560 }}>
      <Breadcrumbs LinkComponent={Link} items={[{ label: 'Orders', href: '/orders' }, { label: 'New order' }]} />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit}>
          <Typography variant="h5" component="h2">
            New order
          </Typography>
          <RhfIdAutocomplete
            name="customerId"
            control={control}
            label="Customer"
            options={customers}
            required
            rules={{ required: 'Choose a customer' }}
            fullWidth
          />
          <RhfTitleCaseField
            name="contact"
            control={control}
            label="Contact name"
            helperText="Tidied up when you leave the field"
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Items"
              type="number"
              required
              {...register('items', { required: 'Enter a quantity', min: { value: 1, message: 'At least 1' } })}
              error={Boolean(formState.errors.items)}
              helperText={formState.errors.items?.message}
              fullWidth
            />
            <TextField
              label="Total (EUR)"
              type="number"
              required
              {...register('total', { required: 'Enter the total', min: { value: 0.01, message: 'More than 0' } })}
              error={Boolean(formState.errors.total)}
              helperText={formState.errors.total?.message}
              fullWidth
            />
          </Stack>
          <Stack spacing={1}>
            <RhfDatePickerField name="deliverBy" control={control} label="Deliver by" fullWidth />
            <DatePresets
              label="Deliver in"
              presets={[
                { label: '+1 week', amount: 1, unit: 'week' },
                { label: '+2 weeks', amount: 2, unit: 'week' },
                { label: '+1 month', amount: 1, unit: 'month' },
              ]}
              getBaseDate={() => getValues('deliverBy') || today()}
              onPick={(iso) => setValue('deliverBy', iso, { shouldDirty: true })}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button component={Link} href="/orders">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Create order
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
