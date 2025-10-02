namespace Celebre.Domain.Enums;

public enum Channel
{
    whatsapp,
    sms,
    email,
    web
}

public enum InteractionKind
{
    mensagem,
    clique,
    foto,
    anexo,
    chamada
}

public enum EngagementTier
{
    bronze,
    prata,
    ouro
}

public enum ActorType
{
    system,
    host,
    bot,
    guest
}

public enum TimelineType
{
    rsvp,
    msg,
    checkin,
    presente,
    tarefa
}

public enum TaskStatus
{
    aberta,
    em_andamento,
    concluida,
    atrasada
}

public enum VendorStatus
{
    ativo,
    inativo,
    pendente
}

public enum GiftStatus
{
    disponivel,
    reservado,
    comprado
}

public enum ConsentSource
{
    form,
    whatsapp,
    admin
}

public enum ConsentAction
{
    opt_in,
    opt_out
}

public enum TableShape
{
    round,
    square,
    rect
}

public enum VendorPartnerStatus
{
    pending_review,
    approved,
    rejected,
    suspended
}

public enum VendorMediaType
{
    logo,
    cover,
    gallery
}

public enum VendorStatusAction
{
    submitted,
    approved,
    rejected,
    suspended,
    updated,
    reactivated
}
