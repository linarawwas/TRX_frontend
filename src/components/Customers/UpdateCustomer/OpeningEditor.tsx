import * as React from "react";
import { toast } from "react-toastify";
import "./OpeningEditor.css";
import {
  updateCustomerOpening,
  type OpeningEditorPayload,
} from "../../../features/customers/apiCustomers";
import { createLogger } from "../../../utils/logger";
import { t } from "../../../utils/i18n";

const logger = createLogger("update-customer-opening");

export function OpeningEditor({
  customerId,
  token,
  onDone,
}: {
  customerId: string;
  token: string;
  onDone: () => void;
}) {
  const [bottles, setBottles] = React.useState<string>("");
  const [balance, setBalance] = React.useState<string>("");
  const allowBump = true;
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottles && !balance) {
      toast.info(t("updateCustomer.opening.toastNeedValue"));
      return;
    }

    if (!window.confirm(t("updateCustomer.opening.confirm1"))) return;
    if (!window.confirm(t("updateCustomer.opening.confirm2"))) return;

    setBusy(true);
    try {
      const body: OpeningEditorPayload = { allowCheckoutBump: !!allowBump };
      if (bottles !== "") body.bottlesLeft = Number(bottles);
      if (balance !== "") body.balanceUSD = Number(balance);
      const result = await updateCustomerOpening(token, customerId, body);
      if (result.error) {
        logger.error("updateCustomerOpening failed", { message: result.error });
        toast.error(result.error || t("updateCustomer.opening.failed"));
        return;
      }
      toast.success(t("updateCustomer.opening.success"));
      onDone();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("updateCustomerOpening threw", { message });
      toast.error(message || t("updateCustomer.opening.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="ucx-note ucx-note--warn"
        role="note"
        id="opening-edit-note"
      >
        {t("updateCustomer.opening.note")}
      </div>
      <form className="ucx-open" onSubmit={submit}>
        <div className="ucx-open__grid">
          <label className="ucx-open__label">
            {t("updateCustomer.opening.labelBottles")}
            <input
              className="ucx-open__input"
              type="number"
              min={0}
              value={bottles}
              onChange={(e) => setBottles(e.target.value)}
              placeholder={t("updateCustomer.opening.phBottles")}
            />
          </label>
          <label className="ucx-open__label">
            {t("updateCustomer.opening.labelBalance")}
            <input
              className="ucx-open__input"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder={t("updateCustomer.opening.phBalance")}
            />
          </label>
        </div>
        <div className="ucx-open__actions">
          <button type="submit" className="ucx-btn primary" disabled={busy}>
            {busy ? t("updateCustomer.opening.busy") : t("updateCustomer.opening.save")}
          </button>
        </div>
      </form>
    </>
  );
}
