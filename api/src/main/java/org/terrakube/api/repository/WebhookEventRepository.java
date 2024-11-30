package org.terrakube.api.repository;

import java.util.UUID;
import java.util.List;

import org.terrakube.api.rs.webhook.WebhookEvent;
import org.terrakube.api.rs.webhook.WebhookEventType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.terrakube.api.rs.webhook.Webhook;

public interface WebhookEventRepository extends JpaRepository<Webhook, UUID> {
    List<WebhookEvent> findByWebhookAndEventOrderByPriorityAsc(Webhook webhook, WebhookEventType event);
}
