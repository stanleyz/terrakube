package org.terrakube.api.rs.webhook;

import java.util.UUID;

import org.terrakube.api.plugin.security.audit.GenericAuditFields;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity(name = "webhook_event")
public class WebhookEvent extends GenericAuditFields {
    private UUID id;

    private String branch;

    private String path;

    @Column(name = "template_id")
    private String templateId;
    
    @Enumerated(EnumType.STRING)
    private WebhookEventType event;
    
    private int priority;
    
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private Webhook webhook;
}